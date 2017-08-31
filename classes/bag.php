<?php
	
include("vape.php");

class Bag {
	private $isFilling;
	private $duration;
	public $vape;
	private $data;
	
	function getProp($prop) {
		$this->$prop = $this->data->GetValue("$prop");
		return $this->$prop;
	}
	
	function setProp($prop, $value) {
		$this->$prop = $value;
		$this->data->SetValue("$prop", $this->$prop);
	}
	
	function __construct() {
		$this->vape = new Vape();
		$this->data = new Data();
	}
	
	public function AddTime($addSec) {
		$dur = $this->getProp("duration");
		$this->setProp("duration", $dur += $addSec);
	}
	
	public function RunFan($speed) {
		$curTime = 0;
		$startDateTime = $this->data->GetDateTime();
		$cleanAge = $this->vape->GetProp("cleanAge");
		$this->setProp("duration", 120 + ((2 - $speed) * 20) + (0.15 * $cleanAge)); // baseline: 120s clean at speed 2. speed bias 20, cleaning bias 0.15
		
		$this->vape->SetFan($speed);
		$this->setProp("isFilling", 1);
		
		while($curTime < $this->getProp("duration"))
		{
			sleep(1);
			$curTime++;
		}
		
		$this->vape->SetFan(0);
		$this->setProp("isFilling", 0);
		$this->vape->IncreaseBagTotal();
		
		$this->vape->Beep();
		$endDateTime = $this->data->GetDateTime();
		$this->data->WriteBag($startDateTime, $endDateTime);
	}
	
	public function StopFan() {
		$this->setProp("duration", 0);
	}
	
	public function RunLast($speed) {
		$this->RunFan($speed);
		
		$this->vape->SetPower(0, false);
	}
	
	public function TurnOn($speed, $temp) {
		$this->vape->SetPower(1, false);
		$this->vape->SetTemp($temp);
		
		// wait for heat
		sleep(150); // 2.5m
		
		$this->RunFan($speed);
	}
}

?>