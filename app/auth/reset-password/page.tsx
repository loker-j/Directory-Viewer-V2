'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [step, setStep] = useState(1); // 1: 手机号验证, 2: 设置新密码
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // 清除该字段的错误信息
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const validatePhoneNumber = () => {
    const newErrors: Record<string, string> = {};
    
    // 验证手机号
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '请输入有效的手机号';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateNewPassword = () => {
    const newErrors: Record<string, string> = {};
    
    // 验证新密码
    if (!formData.newPassword) {
      newErrors.newPassword = '请输入新密码';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = '密码至少8位';
    }
    
    // 验证确认密码
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认新密码';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不匹配';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证手机号
    if (!validatePhoneNumber()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      // 这里实际项目中应该有一个验证手机号的API
      // 为演示简化，我们直接进入下一步
      setStep(2);
    } catch (error: any) {
      setApiError(error.message || '验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证新密码
    if (!validateNewPassword()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    
    try {
      // 发送重置密码请求
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '重置密码失败');
      } else {
        // 重置成功，重定向到登录页面
        router.push('/login?reset=true');
      }
    } catch (error: any) {
      setApiError(error.message || '重置密码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold">重置密码</h1>
        <p className="mt-2 text-gray-600">
          {step === 1 ? '请输入您的手机号进行验证' : '请设置新密码'}
        </p>
      </div>
      
      {apiError && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
          {apiError}
        </div>
      )}
      
      {step === 1 ? (
        <form className="mt-8 space-y-6" onSubmit={handleVerifyPhone}>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              手机号
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              className="form-input mt-1"
              placeholder="请输入手机号"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? '验证中...' : '下一步'}
            </button>
          </div>
        </form>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              新密码
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              className="form-input mt-1"
              placeholder="请设置新密码"
              value={formData.newPassword}
              onChange={handleChange}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              确认新密码
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="form-input mt-1"
              placeholder="请再次输入新密码"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? '重置中...' : '重置密码'}
            </button>
          </div>
        </form>
      )}
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          返回{' '}
          <Link href="/login" className="text-primary hover:underline">
            登录
          </Link>
        </p>
      </div>
    </div>
  );
} 