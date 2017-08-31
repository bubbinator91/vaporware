<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("bag.php");

$bag = new Bag();

echo "Enjoy";

shell_exec("echo \"STATE\" > script.flag");

if (!empty($_POST["TurnOn"])) {
	$setting = explode("|", $_POST["TurnOn"]);
	$bag->TurnOn($setting[0], $setting[1]);
}

if (!empty($_POST["RunFan"])) {
	$setting = $_POST["RunFan"];
	$bag->RunFan($setting);
}

if (!empty($_POST["StopFan"])) {
	$bag->StopFan();
}

if (!empty($_POST["RunLast"])) {
	$setting = $_POST["RunLast"];
	$bag->RunLast($setting);
}

if (!empty($_POST["AddTime"])) {
	$setting = $_POST["AddTime"];
	$bag->AddTime($setting);
}

if (!empty($_POST["SetPower"])) {
	$setting = explode("|", $_POST["SetPower"]);
	$force = ($setting[0] === 'true');
	$bag->vape->SetPower($setting[1], $force);
}

if (!empty($_POST["SetAudio"])) {
	$setting = explode("|", $_POST["SetAudio"]);
	$force = ($setting[0] === 'true');
	$bag->vape->SetAudio($setting[1], $force);
}

if (!empty($_POST["SetTemp"])) {
	$setting = $_POST["SetTemp"];
	$bag->vape->SetTemp($setting);
}

shell_exec("rm -f script.flag");

?>