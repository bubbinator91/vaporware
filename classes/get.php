<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("bag.php");

$bag = new Bag();

echo "Enjoy";

shell_exec("echo \"STATE\" > script.flag");

if (!empty($_GET["TurnOn"])) {
	$setting = explode("|", $_GET["TurnOn"]);
	$bag->TurnOn($setting[0], $setting[1]);
}

if (!empty($_GET["RunFan"])) {
	$setting = $_GET["RunFan"];
	$bag->RunFan($setting);
}

if (!empty($_GET["StopFan"])) {
	$bag->StopFan();
}

if (!empty($_GET["RunLast"])) {
	$setting = $_GET["RunLast"];
	$bag->RunLast($setting);
}

if (!empty($_GET["AddTime"])) {
	$setting = $_GET["AddTime"];
	$bag->AddTime($setting);
}

if (!empty($_GET["SetPower"])) {
	$setting = explode("|", $_GET["SetPower"]);
	$force = ($setting[0] === 'true');
	$bag->vape->SetPower($setting[1], $force);
}

if (!empty($_GET["SetAudio"])) {
	$setting = explode("|", $_GET["SetAudio"]);
	$force = ($setting[0] === 'true');
	$bag->vape->SetAudio($setting[1], $force);
}

if (!empty($_GET["SetTemp"])) {
	$setting = $_GET["SetTemp"];
	$bag->vape->SetTemp($setting);
}

shell_exec("rm -f script.flag");

?>