'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Form, Input, Checkbox, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import ParticleBackground from '@/components/auth/ParticleBackground';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/viewer';

  const onFinish = async (values: any) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('发送登录请求:', {
        phoneNumber: values.username,
        password: '********'
      });
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: values.username,
          password: values.password,
        }),
        credentials: 'include' // 确保包含cookies
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '登录失败');
      }

      console.log('登录成功，设置会话cookie完成');
      console.log('准备跳转到:', redirectUrl);
      
      // 显示成功消息
      setError('');
      
      // 使用最可靠的方式跳转
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    } catch (err: any) {
      console.error('登录错误:', err);
      setError(err.message || '登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 动态粒子背景 */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* 注册表单 */}
      <div className="relative z-10 flex justify-center items-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card 
            className="w-full shadow-lg border-0"
            style={{ 
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
            }}
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#1890ff]">
                欢迎回来
              </h1>
              <p className="text-gray-500 mt-2">登录您的账户，开始创建专业目录页</p>
            </div>
            
            {error && (
              <div className="mb-4 p-2 text-center text-red-500 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            <Form
              name="login"
              initialValues={{ remember: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入您的用户名!' }]}
              >
                <Input 
                  prefix={<UserOutlined className="text-gray-400" />} 
                  placeholder="用户名" 
                  className="h-12 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入您的密码!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="密码"
                  className="h-12 rounded-lg"
                />
              </Form.Item>

              <Form.Item>
                <div className="flex justify-between items-center">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>记住我</Checkbox>
                  </Form.Item>
                  <Link href="/forgot-password" className="text-[#6B48FF] hover:text-[#1890ff] transition-colors">
                    忘记密码?
                  </Link>
                </div>
              </Form.Item>

              <Form.Item>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full h-12 text-lg bg-gradient-to-r from-[#6B48FF] to-[#1890ff]"
                    loading={loading}
                  >
                    登录
                  </Button>
                </motion.div>
              </Form.Item>

              <div className="text-center mt-4">
                <p className="text-gray-500">
                  还没有账户? {' '}
                  <Link href="/auth/register" className="text-[#6B48FF] hover:text-[#1890ff] transition-colors">
                    立即注册
                  </Link>
                </p>
              </div>
            </Form>
          </Card>
        </motion.div>
      </div>
    </main>
  );
} 