import { Waves, Gauge, Wifi, ChartNoAxesColumnIncreasing } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase-config";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  // Batasan untuk parameter yang dimonitor
  const batasMPS = 2.0; // Batas kecepatan arus air dalam m/s
  const batasRPM = 500; // Batas RPM
  const batasRSSI = -80; // Batas kualitas sinyal (lebih besar dari -80 dBm bagus)
  const batasSNR = 8; // Batas Signal-to-Noise Ratio

  const [latestData, setLatestData] = useState(null);
  const [realtimeHistory, setRealtimeHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Referensi ke node latest untuk realtime updates
    const latestRef = ref(db, "DATA/n8wbODFATpcydG51mfIJU1eT0pA3/latest");

    // Array untuk menyimpan history realtime
    let historyBuffer = [];

    // Subscribe ke perubahan data di node latest
    const unsubscribeLatest = onValue(
      latestRef,
      (snapshot) => {
        const data = snapshot.val();
        console.log("Real-time data dari Firebase:", data); // Untuk debugging

        if (data) {
          // Parse payload dari node latest
          let parsedPayload = { speed_mps: 0, rpm: 0, pulses: 0 };

          if (data.payload) {
            try {
              // Jika payload adalah string JSON
              if (typeof data.payload === "string") {
                parsedPayload = JSON.parse(data.payload);
              } else {
                parsedPayload = data.payload;
              }
            } catch (e) {
              console.error("Error parsing payload:", e);
            }
          }

          // Format data realtime
          const timestamp = data.time || new Date().toISOString();
          const formattedData = {
            mps: parsedPayload.speed_mps || 0,
            rpm: Number(parsedPayload.rpm) || 0,
            pulses: Number(parsedPayload.pulses) || 0,
            rssi: Number(data.rssi) || 0,
            snr: Number(data.snr) || 0,
            time: timestamp,
            displayTime: data.time,
          };

          // Update data terbaru
          setLatestData(formattedData);

          // Tambahkan ke history buffer untuk grafik
          historyBuffer = [...historyBuffer, formattedData].slice(-20); // Simpan 20 data terakhir
          setRealtimeHistory(historyBuffer);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching real-time data:", error);
        setLoading(false);
      },
    );

    // Cleanup subscription
    return () => {
      unsubscribeLatest();
    };
  }, []);

  // Cek status keamanan berdasarkan parameter dari data latest
  const isSemuaAman =
    latestData &&
    latestData.mps <= batasMPS &&
    latestData.rpm <= batasRPM &&
    latestData.rssi >= batasRSSI &&
    latestData.snr >= batasSNR;

  // Fungsi helper untuk status
  const getStatus = (value, limit, type = "max") => {
    if (value === null || value === undefined) return "Memuat...";
    if (type === "max") {
      return value <= limit ? "Aman" : "Perlu Perhatian";
    } else {
      return value >= limit ? "Aman" : "Perlu Perhatian";
    }
  };

  const getStatusColor = (value, limit, type = "max") => {
    if (value === null || value === undefined) return "text-gray-500";
    if (type === "max") {
      return value <= limit ? "text-green-500" : "text-red-500";
    } else {
      return value >= limit ? "text-green-500" : "text-red-500";
    }
  };

  const getBgStatusColor = (value, limit, type = "max") => {
    if (value === null || value === undefined) return "bg-gray-500";
    if (type === "max") {
      return value <= limit ? "bg-green-500" : "bg-red-500";
    } else {
      return value >= limit ? "bg-green-500" : "bg-red-500";
    }
  };

  // Format waktu untuk tampilan
  const formatTime = (timeString) => {
    return timeString || "-";
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-b from-white to-blue-500/15 min-h-screen p-5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Menunggu data real-time...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-white to-blue-500/15 min-h-screen p-5">
      {/* Header dengan informasi real-time */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="ml-2 text-sm text-gray-600">Live</span>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span className="font-semibold">Update Terakhir:</span>{" "}
          {formatTime(latestData?.time) || "-"}
        </div>
      </div>

      {/* Cards Utama - Data Real-time */}
      <div className="flex flex-col justify-center mt-5 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-blue-500">
            Pengukur Kecepatan Arus Air Laut
          </h1>
          <p className="text-gray-600 mt-2">Monitoring Real-time dari Sensor</p>
        </div>

        {/* Status Keseluruhan */}
        {latestData && (
          <div
            className={`mt-4 p-3 rounded-lg text-center ${
              isSemuaAman
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            <span className="font-semibold">
              Status Sistem:{" "}
              {isSemuaAman ? "SEMUA AMAN ✓" : "PERLU PERHATIAN !"}
            </span>
          </div>
        )}

        {/* Grid 4 Cards dengan data real-time */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          {/* Card Kecepatan (MPS) */}
          <div className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg">
            <Waves
              className={getStatusColor(latestData?.mps, batasMPS, "max")}
              size={50}
            />
            <p className="font-semibold text-gray-600">Kecepatan Arus</p>
            <p className="font-bold text-2xl">
              {latestData?.mps.toFixed(2)} m/s
            </p>
            <p
              className={`text-sm ${getStatusColor(latestData?.mps, batasMPS, "max")}`}
            >
              {getStatus(latestData?.mps, batasMPS, "max")}
            </p>
          </div>

          {/* Card RPM */}
          <div className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg">
            <Gauge
              className={getStatusColor(latestData?.rpm, batasRPM, "max")}
              size={50}
            />
            <p className="font-semibold text-gray-600">Rotasi (RPM)</p>
            <p className="font-bold text-2xl">
              {latestData?.rpm?.toFixed(0) ?? "0"}
            </p>
            <p
              className={`text-sm ${getStatusColor(latestData?.rpm, batasRPM, "max")}`}
            >
              {getStatus(latestData?.rpm, batasRPM, "max")}
            </p>
          </div>

          {/* Card RSSI */}
          <div className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg">
            <ChartNoAxesColumnIncreasing
              className={getStatusColor(latestData?.rssi, batasRSSI, "min")}
              size={50}
            />
            <p className="font-semibold text-gray-600">RSSI</p>
            <p className="font-bold text-2xl">{latestData?.rssi ?? "0"} dBm</p>
            <p
              className={`text-sm ${getStatusColor(latestData?.rssi, batasRSSI, "min")}`}
            >
              {getStatus(latestData?.rssi, batasRSSI, "min")}
            </p>
          </div>

          {/* Card SNR */}
          <div className="bg-white rounded-3xl p-5 flex flex-col items-center gap-3 shadow-lg">
            <Wifi
              className={getStatusColor(latestData?.snr, batasSNR, "min")}
              size={50}
            />
            <p className="font-semibold text-gray-600">SNR</p>
            <p className="font-bold text-2xl">
              {latestData?.snr?.toFixed(2) ?? "0"} dB
            </p>
            <p
              className={`text-sm ${getStatusColor(latestData?.snr, batasSNR, "min")}`}
            >
              {getStatus(latestData?.snr, batasSNR, "min")}
            </p>
          </div>
        </div>

        {/* Detail Data Real-time */}
        <div className="mt-6 bg-white p-4 rounded-3xl shadow-lg">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Detail Data Real-time:
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Payload:</span>
              <span className="ml-2 font-mono">
                {latestData
                  ? `speed: ${latestData.mps.toFixed(2)}, rpm: ${latestData?.rpm?.toFixed(0) ?? "0"}, pulses: ${latestData.pulses}`
                  : "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-500">RSSI:</span>
              <span className="ml-2 font-bold">
                {latestData?.rssi ?? "-"} dBm
              </span>
            </div>
            <div>
              <span className="text-gray-500">SNR:</span>
              <span className="ml-2 font-bold">
                {latestData?.snr?.toFixed(2) ?? "-"} dB
              </span>
            </div>
            <div>
              <span className="text-gray-500">Waktu:</span>
              <span className="ml-2 font-bold">
                {formatTime(latestData?.time)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grafik Real-time dari Data Terbaru */}
      {realtimeHistory.length > 1 && (
        <div className="mt-8 bg-white p-5 rounded-3xl shadow-lg">
          <h2 className="text-center text-lg font-bold text-blue-500 mb-4">
            Grafik Real-time (20 Data Terakhir)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={realtimeHistory}
              margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="displayTime"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={70}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              {/* <Tooltip 
                labelFormatter={(label) => `Waktu: ${label}`}
                formatter={(value, name) => {
                  if (name === "Kecepatan (m/s)") return [`${value} m/s`, name];
                  if (name === "RPM") return [value.toFixed(0), name];
                  if (name === "RSSI") return [`${value} dBm`, name];
                  if (name === "SNR") return [`${value.toFixed(2)} dB`, name];
                  return [value, name];
                }}
              /> */}
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="mps"
                stroke="#3B82F6"
                name="Kecepatan (m/s)"
                strokeWidth={2}
                dot={{ r: 3 }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tabel Real-time Data */}
      {realtimeHistory.length > 0 && (
        <div className="mt-8 bg-white p-5 rounded-3xl shadow-lg overflow-x-auto">
          <h2 className="text-center text-lg font-bold text-blue-500 mb-4">
            Tabel Data Real-time (20 Data Terakhir)
          </h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Speed (m/s)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RPM
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pulses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RSSI (dBm)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SNR (dB)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {realtimeHistory
                .slice()
                .reverse()
                .map((data, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {data.displayTime}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {data?.mps.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {data.rpm.toFixed(0)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {data.pulses}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {data.rssi}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {data.snr.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tampilkan pesan jika belum ada data */}
      {!latestData && !loading && (
        <div className="mt-8 text-center text-gray-500">
          <p>Belum ada data masuk. Menunggu data dari sensor...</p>
        </div>
      )}
    </div>
  );
}
