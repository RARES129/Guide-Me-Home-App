import React, { useState } from "react";
import { Form, Input, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function LoginForm({ onLogin }) {
    const navigate = useNavigate();

    const handleFinish = (values) => {
        onLogin(values);
    };

    return (
        <div className="auth-container" style={{ maxWidth: 300, margin: "0 auto" }}>
            <Title level={2}>Login</Title>
            <Form
                name="login"
                layout="vertical"
                onFinish={handleFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "Please input your email!" }]}
                >
                    <Input type="email" placeholder="Enter your email" />
                </Form.Item>
                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please input your password!" }]}
                >
                    <Input.Password
                        placeholder="Enter your password"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Login
                    </Button>
                </Form.Item>
            </Form>
            <Text className="redirect-text">
                Don't have an account?{' '}
                <Button type="link" onClick={() => navigate("/register")}>Register here</Button>
            </Text>
        </div>
    );
}

export default LoginForm;
