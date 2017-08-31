<?php
	
include("data.php");

class Vape {
	private $cleanAge;
	private $fanSpeed;
	private $isAudioOn;
	private $isPowerOn;
	private $temp;
	private $data;
	
	public function GetProp($prop) {
		$this->$prop = $this->data->GetValue("$prop");
		return $this->$prop;
	}
	
	function setProp($prop, $value) {
		$this->$prop = $value;
		$this->data->SetValue("$prop", $this->$prop);
	}
	
	function __construct() {
		$this->data = new Data();
	}
	
	public function Beep() {
		$this->SetAudio(1, false);
		$this->SetAudio(0, false);
	}
	
	public function SetAudio($setOn, $force) {
		if(!$force)
		{
			// set based on current state
			// only do something if current state != setting
			if($this->GetProp("isAudioOn") == $setOn)
			{
				return;
			}
		}
		$this->execute("AUDIO");
		$this->setProp("isAudioOn", $setOn);
	}
	
	public function SetFan($speed) {
		$this->execute("FAN" . $speed);
		$this->execute("FAN" . $speed); // yes, send it twice just in case
		$this->setProp("fanSpeed", $speed);
	}
	
	public function IncreaseBagTotal() {
		$age = $this->GetProp("cleanAge");
		$age++;
		$this->setProp("cleanAge", $age);
	}
	
	public function SetPower($setOn, $force) {
		if(!$force)
		{
			// set based on current state
			// only do something if current state != setting
			if($this->GetProp("isPowerOn") == $setOn)
			{
				return;
			}
		}
		
		$this->execute("POWER");
		$this->setProp("isPowerOn", $setOn);
		
		// create or end session in database
		if ($setOn == 1)
			$this->data->GetSession();
		else
			$this->data->EndSession();
	}
	
	public function Cleaning() {
		$this->setProp("cleanAge", 0);
	}
	
	public function SetTemp($setTemp) {
		if ($setTemp >= 230)
		{
			$this->upTemp(230, $setTemp);
		}
		elseif ($setTemp >= 220)
		{
			$this->upTemp(220, $setTemp);
		}
		elseif ($setTemp >= 210)
		{
			$this->upTemp(210, $setTemp);
		}
		elseif ($setTemp >= 200)
		{
			$this->upTemp(200, $setTemp);
		}
		else
		{
			$this->downTemp(200, $setTemp);
		}
	}
	
	function upTemp($startTemp, $endTemp)
	{
		$this->execute("TEMP" . $startTemp);
		$this->setProp("temp", $startTemp);
		for ($i = 0; $i < ($endTemp - $startTemp); $i++)
		{
			// increase temp
			sleep(1);
			$this->execute("TEMPUP");
			$tmp = $this->GetProp("temp");
			$tmp++;
			$this->setProp("temp", $tmp);
		}
	}
	
	function downTemp($startTemp, $endTemp)
	{
		$this->execute("TEMP" . $startTemp);
		$this->setProp("temp", $startTemp);
		for ($i = 0; $i < ($startTemp - $endTemp); $i++)
		{
			// decrease temp
			sleep(1);
			$this->execute("TEMPDOWN");
			$tmp = $this->GetProp("temp");
			$tmp--;
			$this->setProp("temp", $tmp);
		}
	}
	
	function execute($cmd) {
		/* Possible commands:
			AUDIO
			FAN0
			FAN1
			FAN2
			FAN3
			LIGHT
			POWER
			TEMPUP
			TEMPDOWN
			TEMP200
			TEMP210
			TEMP220
			TEMP230
			TIME0
			TIME2
			TIME4
			*/
		
		$output = shell_exec("irsend send_once arizer " . $cmd);
		echo $output;
		usleep(300000); // 0.3s sleep
	}
}

?>