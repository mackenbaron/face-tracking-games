<?php

/**
 * Obtains all measurements of a given subjects, crunching all the numbers.
 */

require_once(dirname(__FILE__) . '/config.php');
require_once(dirname(__FILE__) . '/inc/functions.php');

if (php_sapi_name() != 'cli') {
    echo 'This script should be run from the command line.';
    exit();
}

if($argc < 2) {
    echo "Usage: \n";
    echo " php analyze.php [<subjectId>|<firstId>:<lastId>] [options]\n\n";
    echo "Options:\n";
    echo " --report      Prints the processing as a report.\n";
    echo " --csv <file>  Saves the processing as an CSV file defined by <file>.\n";
    exit(1);
}

$aSubjectIdStart = 0;
$aSubjectIdEnd = 0;

if(strpos($argv[1], ':') !== false) {
    $aValues = explode(':', $argv[1]);

    if(count($aValues) != 2) {
        echo 'Invalid subject range "'.$argv[1].'". It should be "start:end", e.g. 400:418.' . "\n";
        exit(2);
    }

    $aSubjectIdStart = $aValues[0];
    $aSubjectIdEnd = $aValues[1];

} else {
    $aSubjectIdStart = $argv[1];
    $aSubjectIdEnd = $argv[1];
}

// If nothing is specified, assume this is a report
$aFormat = isset($argv[2]) ? $argv[2] : '--report';

$aIsReport = $aFormat == '--report';
$aIsCSV = $aFormat == '--csv';
$aCSVFile = 'out.csv';

if($aIsCSV) {
    if(!isset($argv[3])) {
        echo 'Option --csv requires a file.' . "\n";
        exit(2);

    } else {
        $aCSVFile = $argv[3];
    }
}

$aDb = new PDO('sqlite:' . DB_FILE);
$aDb->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$aGroupingAmount = 15; // size of the group when calculating grouped mean for HR entries.
$aSubjects = array();

for($i = $aSubjectIdStart; $i <= $aSubjectIdEnd; $i++) {
    echo 'Subject: ' . $i . "\n";
    echo '*********************************************************************' . "\n";

    if($aIsReport) {
        echo "Analysis\n";
        echo '----------------------------------------------------' . "\n";
    }

    $aData = getSubjectData($aDb, $i);
    $aStats = crunchNumbers($aData, $aGroupingAmount);
    $aSubjects[$i] = $aStats;

    if($aIsReport) {
        echo "\nSubject results\n";
        echo '----------------------------------------------------' . "\n";
        echo 'HR baseline: ' . $aStats['baseline'] ."\n";
        $j = 1;
        foreach($aStats['rests'] as $aRest) {
            echo 'HR mean (rest #'.$j++.'): ' . $aRest['hr-mean'] ."\n";
        }

        echo "\nExperiment details\n";
        echo '----------------------------------------------------' . "\n";

        foreach($aStats['games'] as $aGame) {
            echo 'Action: playing ' . $aGame['name'] . ' (id='.$aGame['id'].')'."\n";
            echo 'HR mean: ' . $aGame['hr-mean'] ."\n";
            echo 'HR mean (every '.$aGroupingAmount.' seconds):'."\n";
            printSetAsCSV($aGame['hr-means']);
            echo "\nHR mean baseline (every ".$aGroupingAmount." seconds): \n";
            printSetAsCSV($aGame['hr-means-baseline']);
            echo "\nHR: \n";
            printSetAsCSV($aGame['hr']);
            echo "\n";
        }

        $j = 1;
        foreach($aStats['rests'] as $aRest) {
            echo 'Action: resting #' . $j++ ."\n";
            echo 'HR mean: ' . $aRest['hr-mean'] ."\n";
            echo 'HR mean (every '.$aGroupingAmount.' seconds):'."\n";
            printSetAsCSV($aRest['hr-means']);
            echo "\nHR: \n";
            printSetAsCSV($aRest['hr']);
            echo "\n";
        }
    }
    echo "\n";
}

if($aIsCSV) {
    $aTotal = 0;
    $aFile = fopen($aCSVFile, 'w');

    fwrite($aFile, "time,");

    foreach($aSubjects as $aId => $aInfo) {
        foreach($aInfo['games'] as $aGame) {
            fwrite($aFile, $aId . "-hr-means-" . $aGame['name'] . ",");
            fwrite($aFile, $aId . "-hr-means-baseline-" . $aGame['name'] . ",");
            fwrite($aFile, $aId . "-hr-" . $aGame['name'] . ",");

            // Find out the maximum amount of entries for HR
            if(count($aGame['hr']) > $aTotal) {
                $aTotal = count($aGame['hr']);
            }
        }

        foreach($aInfo['rests'] as $aNum => $aRest) {
            fwrite($aFile, $aId . "-hr-means-rest-" . $aNum . ",");
            fwrite($aFile, $aId . "-hr-rest-" . $aNum . ",");
        }
    }

    fwrite($aFile, "\n");

    for($i = 0; $i < $aTotal; $i++) {
        fwrite($aFile, $i . ",");

        foreach($aSubjects as $aId => $aInfo) {
            foreach($aInfo['games'] as $aGame) {
                fwrite($aFile, ($i < count($aGame['hr-means']) ? sprintf('%.2f', $aGame['hr-means'][$i]) : '') . ",");
                fwrite($aFile, ($i < count($aGame['hr-means-baseline']) ? sprintf('%.2f', $aGame['hr-means-baseline'][$i]) : '') . ",");
                fwrite($aFile, ($i < count($aGame['hr']) ? $aGame['hr'][$i] : '') . ",");
            }

            foreach($aInfo['rests'] as $aNum => $aRest) {
                fwrite($aFile, ($i < count($aRest['hr-means']) ? sprintf('%.2f', $aRest['hr-means'][$i]) : '') . ",");
                fwrite($aFile, ($i < count($aRest['hr']) ? $aRest['hr'][$i] : '') . ",");
            }
        }
        fwrite($aFile, "\n");
    }

    fclose($aFile);

    echo "\nCSV data successfuly saved to file \"".$aCSVFile."\".\n";
}

?>
