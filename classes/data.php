<?php
	
	class Data {
		private $connection;
		
		function connect() {
			$servername = "localhost";
			$username = "***";
			$password = "***";
			$dbname = "vaporware";
			
			// Create connection
			$this->connection = new mysqli($servername, $username, $password, $dbname);
			
			// Check connection
			if ($this->connection->connect_error) {
			    die("Connection failed: " . $this->connection->connect_error);
			}
		}
		
		function disconnect() {
			$this->connection->close();
		}
		
		public function GetValue($column) {
			$this->connect();
			$sql = "SELECT $column FROM state";
			$result = $this->connection->query($sql);
			$return = 0;
			
			if ($result->num_rows > 0) {
			    // output data of each row
			    while($row = $result->fetch_assoc()) {
			        $return = $row[$column];
			    }
			} else {
			    echo "Invalid column specified or database failure";
			}
			$this->disconnect();
			
			return $return;
		}
		
		public function SetValue($column, $value) {
			$this->connect();
			$sql = "UPDATE state SET $column='$value'";

			if (!($this->connection->query($sql) === TRUE)) {
			    echo "Invalid column specified or database failure: " . $this->connection->error;
			}
			$this->disconnect();
		}
		
		public function WriteBag($startDateTime, $endDateTime) {
			$this->connect();
			$sql = "INSERT INTO bags (sessionID, start, end) VALUES (" . $this->GetSession() . ", '$startDateTime', '$endDateTime')";

			if (!($this->connection->query($sql) === TRUE)) {
			    echo "Database failure: " . $this->connection->error;
			}
			$this->disconnect();
		}
		
		public function GetSession() {
			$this->connect();
			$sessionId = $this->getActiveSession();
			if ($sessionId > 0) {
			    // get active session
			    return $sessionId;
			}
			else {
				// no active session
				$sql2 = "INSERT INTO sessions (start) VALUES ('" . $this->GetDateTime() . "')";

				if ($this->connection->query($sql2) === TRUE) {
					return $this->getActiveSession();
				} else {
				    echo "Error getting session: " . $this->connection->error;
				    return 0;
				}
			}
			
			
			$this->disconnect();
		}
		
		public function EndSession() {
			$this->connect();
			$sessionId = $this->GetSession();
			
			
			$sql = "UPDATE sessions SET end='" . $this->GetDateTime() . "' where id = $sessionId";

			if (!($this->connection->query($sql) === TRUE)) {
			    echo "Database failure: " . $this->connection->error;
			}
			
			
			$this->disconnect();
		}
	
		public function GetDateTime() {
			return date("Y-m-d H:i:s");
		}
		
		function getActiveSession() {
			$sql = "SELECT id FROM sessions WHERE end is null";
			$result = $this->connection->query($sql);
			$return = 0;
			
			if ($result->num_rows > 0) {
			    // get active session
			    while($row = $result->fetch_assoc()) {
			        $return = $row['id'];
			    }
			}
			
			return $return;
		}
	}
	
	?>