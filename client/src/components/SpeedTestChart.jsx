import React, { useState, useEffect } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import styled from "styled-components";

const Container = styled.div`
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: #333;
  text-align: center;
`;

const Button = styled(motion.button)`
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  &:hover {
    background-color: #0056b3;
  }
`;

const SpeedTestChart = () => {
  const [speedData, setSpeedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSpeedTest = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_BASE_URI}/api/speedtest`);
      const newSpeed = { time: new Date().toLocaleTimeString(), speed: parseFloat(response.data.speed) };
      setSpeedData(prevData => [...prevData.slice(-9), newSpeed]);
    } catch (error) {
      console.error("Error fetching speed test data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeedTest();
    const interval = setInterval(fetchSpeedTest, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Container>
      <Title>Internet Speed Test</Title>
      {loading && <p>Testing speed...</p>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={speedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, "dataMax + 5"]} label={{ value: "Speed (Mbps)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="speed" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      <Button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={fetchSpeedTest}>
        Run Speed Test
      </Button>
    </Container>
  );
};

export default SpeedTestChart;