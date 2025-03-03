import React, { useState } from "react";
import { Form, Input, Button, Radio, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

function RegisterForm({ onRegister }) {
  const navigate = useNavigate();

  const handleFinish = (values) => {
    if (values.password !== values.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    onRegister({ email: values.email, password: values.password, role: values.role });
  };

  return (
      <div className="auth-container">
        <Title level={2}>Register</Title>
        <Form
            name="register"
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

          <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: "Please confirm your password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match!'));
                  },
                }),
              ]}
          >
            <Input.Password
                placeholder="Confirm your password"
            />
          </Form.Item>
          <Form.Item
              label="Role"
              name="role"
              initialValue="user"
              rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Radio.Group>
              <Radio value="user">User</Radio>
              <Radio value="assistant">Assistant</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Register
            </Button>
          </Form.Item>
        </Form>
        <Text className="redirect-text">
          Do you already have an account?{' '}
          <Button type="link" onClick={() => navigate("/login")}>Login here</Button>
        </Text>
      </div>
  );
}

export default RegisterForm;
