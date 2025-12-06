document.addEventListener('DOMContentLoaded', function () {
    // --- อ้างอิง Element (เอา lightValue และ lightTarget ออก) ---
    const modeButtons = document.querySelectorAll('.mode-btn');
    const tempValue = document.getElementById('temp-value');
    const humidityValue = document.getElementById('humidity-value');
    const co2Value = document.getElementById('co2-value');
    const tempTarget = document.getElementById('temp-target');
    const humidityTarget = document.getElementById('humidity-target');
    const co2Target = document.getElementById('co2-target');

    // --- ค่าเป้าหมาย (เอา light ออก) ---
    const modes = {
        mode1: { name: "Incubation Period", temp: "25-30 °C", humidity: "> 80 %", co2: "> 1000 ppm" },
        mode2: { name: "Pinning Stage", temp: "18-25 °C", humidity: "85-95 %", co2: "< 1000 ppm" },
        mode3: { name: "Fruiting Stage", temp: "18-25 °C", humidity: "80-90 %", co2: "< 1000 ppm " }
    };

    // --- ฟังก์ชันดึงข้อมูล (เอา lightValue ออก) ---
    function fetchSensorData() {
        fetch('api.php?action=get_sensor_data')
            .then(response => response.json())
            .then(data => {
                tempValue.textContent = `${data.temperature || '--'} °C`;
                humidityValue.textContent = `${data.humidity || '--'} %`;
                co2Value.textContent = `${data.co2 || '--'} ppm`;

                const timestamp = new Date();
                addDataToCharts(timestamp, data.temperature, data.humidity, data.co2);
            })
            .catch(error => console.error("Could not fetch sensor data:", error));
    }

    // --- ฟังก์ชันดึงข้อมูลย้อนหลัง (ไม่มีการเปลี่ยนแปลง) ---
    function fetchHistoricalData() {
        fetch('api.php?action=get_historical_data&hours=24') // ดึงย้อนหลัง 24 ชม.
            .then(response => response.json())
            .then(data => {
                data.forEach(record => {
                    const timestamp = new Date(record.timestamp);
                    // **สำคัญ:** ส่ง null สำหรับค่า light ที่ไม่มีอยู่
                    addDataToCharts(timestamp, record.temperature, record.humidity, record.co2);
                });
            })
            .catch(error => console.error("Could not fetch historical data:", error));
    }

    // --- ฟังก์ชันเปลี่ยนโหมด (เอา lightTarget ออก) ---
    function changeMode(modeId) {
        const modeKey = `mode${modeId}`;
        const settings = modes[modeKey];

        fetch(`api.php?action=set_mode&mode=${modeId}`); // ส่งคำสั่งอย่างเดียว

        tempTarget.textContent = settings.temp;
        humidityTarget.textContent = settings.humidity;
        co2Target.textContent = settings.co2;

        modeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === modeKey) btn.classList.add('active');
        });
    }

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modeId = button.id.replace('mode', '');
            changeMode(modeId);
        });
    });

    // --- ส่วนของกราฟ (เหมือนเดิม) ---
    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    const ctxHumidity = document.getElementById('humidityChart').getContext('2d');
    const ctxCo2 = document.getElementById('co2Chart').getContext('2d');
    function createChartOptions(yAxisTitle) { return { responsive: true, maintainAspectRatio: false, scales: { x: { type: 'time', time: { unit: 'hour', displayFormats: { hour: 'HH:mm' } } }, y: { title: { display: true, text: yAxisTitle } } }, plugins: { legend: { display: false } } }; }
    const tempChart = new Chart(ctxTemp, { type: 'line', data: { datasets: [{ label: 'Temperature', borderColor: 'rgba(231, 76, 60, 1)', data: [] }] }, options: createChartOptions('Temperature (°C)') });
    const humidityChart = new Chart(ctxHumidity, { type: 'line', data: { datasets: [{ label: 'Humidity', borderColor: 'rgba(52, 152, 219, 1)', data: [] }] }, options: createChartOptions('Humidity (%)') });
    const co2Chart = new Chart(ctxCo2, { type: 'line', data: { datasets: [{ label: 'CO2', borderColor: 'rgba(46, 204, 113, 1)', data: [] }] }, options: createChartOptions('CO2 (ppm)') });
    const maxDataPoints = 200;

    function addDataToCharts(time, temp, humidity, co2) {
        const charts = [tempChart, humidityChart, co2Chart];
        const dataValues = [temp, humidity, co2];

        charts.forEach((chart, index) => {
            chart.data.labels.push(time);
            chart.data.datasets[0].data.push(dataValues[index]);
            while (chart.data.labels.length > maxDataPoints) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.update('none');
        });
    }

    // --- เริ่มการทำงาน ---
    changeMode('1');
    fetchHistoricalData();
    setInterval(fetchSensorData, 5000);
});
