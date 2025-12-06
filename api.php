<?php
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$sensor_data_json_file = 'sensor_data.json';
$command_file = 'command.txt';
$sensor_log_csv_file = '/home/natnaree/sensor_log.csv'; 

switch ($action) {
    // ... (case 'get_sensor_data' และ 'set_mode' เหมือนเดิม) ...
    case 'get_sensor_data':
        if (file_exists($sensor_data_json_file)) {
            echo file_get_contents($sensor_data_json_file);
        } else {
            echo json_encode(['error' => 'Sensor data not found']);
        }
        break;
    case 'set_mode':
        $mode = $_GET['mode'] ?? '1';
        if (in_array($mode, ['1', '2', '3'])) {
            file_put_contents($command_file, $mode);
            echo json_encode(['success' => true, 'message' => "Mode set to $mode"]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid mode']);
        }
        break;

    case 'get_historical_data':
        // **(ของใหม่) รับค่าชั่วโมงที่ต้องการดึงข้อมูลย้อนหลัง**
        $hours_to_fetch = isset($_GET['hours']) ? (int)$_GET['hours'] : 24; // ถ้าไม่ระบุ, ดึงย้อนหลัง 24 ชม.

        // คำนวณเวลาเริ่มต้นที่ต้องการ
        $cutoff_time = new DateTime();
        $cutoff_time->modify("-$hours_to_fetch hours");

        if (file_exists($sensor_log_csv_file)) {
            $data = [];
            if (($handle = fopen($sensor_log_csv_file, "r")) !== FALSE) {
                $header = fgetcsv($handle);
                while (($row = fgetcsv($handle)) !== FALSE) {
                    $record = array_combine($header, $row);

                    // **(ของใหม่) กรองข้อมูลตามเวลา**
                    $record_time = new DateTime($record['timestamp']);
                    if ($record_time >= $cutoff_time) {
                        $data[] = $record;
                    }
                }
                fclose($handle);
            }
            echo json_encode($data);
        } else {
            echo json_encode([]);
        }
        break;

    default:
        echo json_encode(['error' => 'Invalid action']);
        break;
}
?>
