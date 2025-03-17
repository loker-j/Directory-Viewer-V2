'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Form, Input, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import ParticleBackground from '@/components/auth/ParticleBackground';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Success:', values);
    // 这里添加注册逻辑
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
                创建账户
              </h1>
              <p className="text-gray-500 mt-2">注册账户，开始生成专业网盘目录页</p>
            </div>
            
            <Form
              name="register"
              initialValues={{ agreement: true }}
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
                name="email"
                rules={[
                  { required: true, message: '请输入您的邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined className="text-gray-400" />} 
                  placeholder="邮箱" 
                  className="h-12 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入您的密码!' },
                  { min: 8, message: '密码长度至少为8个字符!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="密码"
                  className="h-12 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="confirm"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认您的密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不匹配!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="确认密码"
                  className="h-12 rounded-lg"
                />
              </Form.Item>

              <Form.Item
                name="agreement"
                valuePropName="checked"
                rules={[
                  {
                    validator: (_, value) =>
                      value ? Promise.resolve() : Promise.reject(new Error('请阅读并同意条款')),
                  },
                ]}
              >
                <Checkbox>
                  我已阅读并同意 <Link href="/terms" className="text-[#6B48FF]">服务条款</Link> 和 <Link href="/privacy" className="text-[#6B48FF]">隐私政策</Link>
                </Checkbox>
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
                    注册
                  </Button>
                </motion.div>
              </Form.Item>

              <div className="text-center mt-4">
                <p className="text-gray-500">
                  已有账户? {' '}
                  <Link href="/auth/login" className="text-[#6B48FF] hover:text-[#1890ff] transition-colors">
                    立即登录
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