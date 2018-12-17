<?php

include_once 'mysql.php';

header("Content-Type: text/event-stream\n\n");
session_start();

if (isset($_GET['f'])) {
    //Verbindung zur Datenbank
    connection();

    //Login
    if ($_GET['f'] == 1) {
        if (isset($_POST['username']) AND isset($_POST['password'])) {
            $username = addslashes($_POST['username']);
            $password = addslashes($_POST['password']);
            echo json_encode(login($username, $password));
        }
    }

    //Status
    if ($_GET['f'] == 2) {
        if (isset($_SESSION['login'])) {
            echo json_encode(array($_SESSION['login'] . "", $_SESSION['username']));
        } else {
            echo json_encode(array(0, 0));
        }
    }

    //Logout
    if ($_GET['f'] == 3 && $_SESSION['login']) {
        $_SESSION['login'] = false;
        $_SESSION['username'] = '';
        echo 1;
    }

    //setNewTermin
    if ($_GET['f'] == 4) {
        if (isset($_POST['tb']) AND isset($_POST['tz'])) {
            $tb = addslashes($_POST['tb']);
            $tz = addslashes($_POST['tz']);
            setNewTermin($tb, $tz);
            echo 1;
        }
    }

    //setNewTermin
    if ($_GET['f'] == 5) {
        getTermine();
    }

    //setNewStimme
    if ($_GET['f'] == 6) {
        if (isset($_POST['id']) AND isset($_POST['name']) AND isset($_POST['time']) AND is_numeric($_POST['id'])) {
            $name = addslashes($_POST['name']);
            $time = addslashes($_POST['time']);
            $id = $_POST['id'];
            if (dontExistStimme($name, $id)) {
                setNewStimme($name, $time, $id);
                echo 1;
            }
            else
            {
                echo 0;
            }
            
        }
    }

    //setNewStimme
    if ($_GET['f'] == 7 AND is_numeric($_GET['id'])) {
        getStimmen($_GET['id']);
    }

    //Schaber ist da
    if ($_GET['f'] == 8 && $_SESSION['login']) {
        if (isset($_POST['id']) AND is_numeric($_POST['id'])) {
            eventStop($_POST['id']);
            echo 1;
        }
    }
}

function eventStop($id) {
    mysql_query("UPDATE termine SET win=1,wintime='" . getTime() . "' WHERE id = " . $id . " AND win = 0") or die(mysql_error());
}

function getTime() {
    return date("H:i:s", time());
}

function getStimmen($id) {
    if ($id) {
        header('Content-Type: text/event-stream');
        header('Cache-Control: no-cache');
        echo "event: newStimme\n";


        $timestamp = getTime();
        $winStimme = array();
        $neuStimme = array();
        $loseStimme = array();


        $result = mysql_query("SELECT bez,zeit,win,wintime FROM termine WHERE id =" . $id) or die(mysql_error());
        while ($row = mysql_fetch_array($result)) {
            $bez = $row['bez'];
            $zeit = date('d.m.Y', strtotime(str_replace('.', '-', $row['zeit'])));
            $win = $row['win'];
            $wintime = $row['wintime'];
            break;
        }

        $stimmen = array();
        $result2 = mysql_query("SELECT id,von,zeit FROM stimmen WHERE terminid = " . $id . " ORDER By zeit") or die("data:" . mysql_error());
        while ($row = mysql_fetch_array($result2)) {
            $z = $row['zeit'];
            $stimmen[] = array($row['von'], $z);
        }

        if (strtotime($zeit) <= strtotime(date("d.m.Y"))) {
            $winStimTime = 0;
            foreach ($stimmen as $key => $stimme) {
                $z = $stimme[1];
                $n = $stimme[0];
                $isold = false;
                $max = "23:59";
                if (naechstHoechsteZeit($stimmen, $key)) {
                    $nextTime = naechstHoechsteZeit($stimmen, $key);
                    $max = get_time_difference($z, $nextTime);
                }
                $mi = strtotime("00:00");
                $zi = strtotime($z) - $mi;
                $maxi = strtotime($max) - $mi;

                //Wenn spiel noch nicht fertig
                if (!$win) {
                    if (strtotime($zeit) < strtotime(date("d.m.Y"))) {
                        $loseStimme[] = array($n, $z);
                    } else {
                        $timestampi = strtotime($timestamp) - $mi;
                        if ($zi + $maxi <= $timestampi) {
                            $isold = true;
                        }
                        if (!$isold) {
                            $neuStimme[] = array($n, $z);
                        } else {
                            $loseStimme[] = array($n, $z);
                        }
                    }
                } else {
                    $timestampi = strtotime($wintime) - $mi;
                    if ($zi + $maxi <= $timestampi) {
                        $isold = true;
                    }
                    if (!$isold AND (!$winStimTime OR $winStimTime == $z)) {
                        $winStimTime = $z;
                        $winStimme[] = array($n, $z);
                    } else {
                        $loseStimme[] = array($n, $z);
                    }
                }
            }
        } else {
            $neuStimme = $stimmen;
        }
        $rv = 0;
        if ($wintime) {
            $rv = $wintime;
        }
        echo "data:" . json_encode(array($rv, $neuStimme, $loseStimme, $winStimme, $bez, $zeit)) . "\n\n";
        flush();
    }
}

function get_time_difference($start_time_o, $end_time_o) {
    $start_time = explode(":", $start_time_o);
    $end_time = explode(":", $end_time_o);

    $start_time_stamp = mktime($start_time[0], $start_time[1], 0, 0, 0, 0);
    $end_time_stamp = mktime($end_time[0], $end_time[1], 0, 0, 0, 0);

    $time_difference = $end_time_stamp - $start_time_stamp;

    return gmdate("H:i:s", $time_difference / 2);
}

function naechstNiedrigeZeit($stimmen, $id) {
    for ($i = $id - 1; $i >= 0; $i--) {
        if ($stimmen[$i][1] <= $stimmen[$id][1]) {
            return $stimmen[$i][1];
        }
    }
    return false;
}

function naechstHoechsteZeit($stimmen, $id) {
    for ($i = $id + 1; $i < count($stimmen); $i++) {
        if ($stimmen[$i][1] > $stimmen[$id][1]) {
            return $stimmen[$i][1];
        }
    }
    return false;
}

function dontExistStimme($name, $id)
{
    $result = mysql_query('SELECT von FROM stimmen WHERE terminid = '.$id.' AND von = "'.$name.'"') or die(mysql_error());
    while ($row = mysql_fetch_array($result)) {
        return false;
    }
    return true;
}

function setNewStimme($name, $time, $id) {
    mysql_query("INSERT INTO stimmen (von, zeit, terminid) VALUES ('" . $name . "','" . $time . "'," . $id . ")") or die(mysql_error());
}

function getTermine() {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');

    echo "event: newTermin\n";
    $future = array();
    $past = array();
    $result = mysql_query("SELECT bez,zeit,win,id FROM termine ORDER By zeit") or die("data:" . mysql_error());
    while ($row = mysql_fetch_array($result)) {
        $zeit = date('d.m.Y', strtotime(str_replace('.', '-', $row['zeit'])));
        $win = 0;
        if ($row['win']) {
            $win = 1;
        }
        if (!$win AND strtotime($row['zeit']) >= strtotime(date("d-m-Y"))) {
            $future[] = array($row['bez'], $zeit, $win, $row['id']);
        } else {
            $past[] = array($row['bez'], $zeit, $win, $row['id']);
        }
    }
    echo "data:" . json_encode(array($future, array_reverse($past))) . "\n\n";
    flush();
}

function setNewTermin($tb, $tz) {
    $tz = date('Y-m-d', strtotime(str_replace('-', '.', $tz)));
    mysql_query("INSERT INTO termine (bez, zeit) VALUES ('" . $tb . "','" . $tz . "')") or die(mysql_error());
}

function login($username, $password) {
    $result = mysql_query("SELECT id,username FROM users WHERE username like '" . $username . "' AND passwort = '" . $password . "'") or die(mysql_error());
    while ($row = mysql_fetch_array($result)) {
        return setLoginValue($username);
        break;
    }
    return 0;
}

function setLoginValue($username) {
    $_SESSION['login'] = true;
    $_SESSION['username'] = $username;
    return array($username);
}

?>
