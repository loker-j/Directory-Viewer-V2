'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button, Card, Progress, Tag } from 'antd';
import { useTheme } from 'next-themes';
import ParticleBackground from '@/components/auth/ParticleBackground';
// 导入React Icons
import { FaFile, FaSearch, FaLaptop, FaShareAlt, FaShieldAlt, FaSave, FaTree, FaExclamationTriangle, FaCheck, FaCloud, FaPaintBrush, FaChartLine } from 'react-icons/fa';

// 替换原来的备选图标函数
const FeatureIcon = ({ type }: { type: string }) => {
  switch(type) {
    case 'file':
      return <FaFile size={64} className="text-[#6B48FF]" />;
    case 'search':
      return <FaSearch size={64} className="text-[#6B48FF]" />;
    case 'devices':
      return <FaLaptop size={64} className="text-[#6B48FF]" />;
    case 'share':
      return <FaShareAlt size={64} className="text-[#6B48FF]" />;
    case 'security':
      return <FaShieldAlt size={64} className="text-[#6B48FF]" />;
    case 'backup':
      return <FaSave size={64} className="text-[#6B48FF]" />;
    default:
      return <FaFile size={64} className="text-[#6B48FF]" />;
  }
};

export default function Home() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      title: '完整文件名展示',
      description: '保留原始命名，清晰展示文件结构',
      icon: 'file',
    },
    {
      title: '文件夹层级结构',
      description: '直观可视化展示文件夹嵌套关系',
      icon: 'security',
    },
    {
      title: '基础文件信息',
      description: '展示类型/大小/修改时间等关键信息',
      icon: 'share',
    },
    {
      title: '关键词搜索',
      description: '快速定位文件，高亮匹配项',
      icon: 'search',
    },
    {
      title: '自由展开/折叠',
      description: '灵活控制任意层级的展示方式',
      icon: 'devices',
    },
    {
      title: '复制文本目录',
      description: '一键复制整个目录结构文本',
      icon: 'backup',
    },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* 动态粒子背景 */}
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* 主视觉区 */}
      <section className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 py-16 md:py-24">
        <motion.div 
          className="w-full md:w-3/5 mb-8 md:mb-0"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#1890ff]">
            网盘目录查看器
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">
            一键生成可交互目录树，替代低效截图沟通。把网盘链接变成专业目录页，客户自助浏览省心50%！
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button type="primary" size="large" className="h-12 px-8 text-lg bg-gradient-to-r from-[#6B48FF] to-[#1890ff]">
              立即开始
            </Button>
          </motion.div>
        </motion.div>
        <motion.div 
          className="w-full md:w-2/5"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* 使用内联SVG替代Image组件 */}
          <svg width="600" height="400" viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <rect width="600" height="400" rx="20" fill="url(#hero_paint0_linear)" fillOpacity="0.1"/>
            
            {/* 文件夹图标 */}
            <rect x="150" y="100" width="300" height="200" rx="10" fill="url(#hero_paint1_linear)" fillOpacity="0.8"/>
            <path d="M150 120C150 109.507 158.507 101 169 101H250L270 120H431C441.493 120 450 128.507 450 139V290C450 300.493 441.493 309 431 309H169C158.507 309 150 300.493 150 290V120Z" fill="url(#hero_paint2_linear)"/>
            
            {/* 文件图标 */}
            <rect x="200" y="160" width="80" height="100" rx="5" fill="white" fillOpacity="0.9"/>
            <rect x="210" y="180" width="60" height="5" rx="2.5" fill="#6B48FF" fillOpacity="0.7"/>
            <rect x="210" y="195" width="60" height="5" rx="2.5" fill="#6B48FF" fillOpacity="0.7"/>
            <rect x="210" y="210" width="40" height="5" rx="2.5" fill="#6B48FF" fillOpacity="0.7"/>
            <rect x="210" y="225" width="50" height="5" rx="2.5" fill="#6B48FF" fillOpacity="0.7"/>
            
            {/* 装饰元素 */}
            <circle cx="150" cy="350" r="20" fill="url(#hero_paint3_linear)" fillOpacity="0.5"/>
            <circle cx="450" cy="50" r="30" fill="url(#hero_paint4_linear)" fillOpacity="0.5"/>
            <circle cx="500" cy="300" r="15" fill="url(#hero_paint5_linear)" fillOpacity="0.5"/>
            <circle cx="100" cy="100" r="25" fill="url(#hero_paint6_linear)" fillOpacity="0.5"/>
            
            <defs>
              <linearGradient id="hero_paint0_linear" x1="0" y1="0" x2="600" y2="400" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF" stopOpacity="0.2"/>
                <stop offset="1" stopColor="#1890FF" stopOpacity="0.2"/>
              </linearGradient>
              <linearGradient id="hero_paint1_linear" x1="150" y1="100" x2="450" y2="300" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF" stopOpacity="0.1"/>
                <stop offset="1" stopColor="#1890FF" stopOpacity="0.1"/>
              </linearGradient>
              <linearGradient id="hero_paint2_linear" x1="150" y1="101" x2="450" y2="309" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF"/>
                <stop offset="1" stopColor="#1890FF"/>
              </linearGradient>
              <linearGradient id="hero_paint3_linear" x1="130" y1="330" x2="170" y2="370" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF"/>
                <stop offset="1" stopColor="#1890FF"/>
              </linearGradient>
              <linearGradient id="hero_paint4_linear" x1="420" y1="20" x2="480" y2="80" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF"/>
                <stop offset="1" stopColor="#1890FF"/>
              </linearGradient>
              <linearGradient id="hero_paint5_linear" x1="485" y1="285" x2="515" y2="315" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF"/>
                <stop offset="1" stopColor="#1890FF"/>
              </linearGradient>
              <linearGradient id="hero_paint6_linear" x1="75" y1="75" x2="125" y2="125" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6B48FF"/>
                <stop offset="1" stopColor="#1890FF"/>
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </section>

      {/* 功能矩阵 */}
      <section className="relative z-10 px-8 py-16 md:py-24">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          精准功能描述
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ 
                y: -10,
                boxShadow: '0 20px 25px -5px rgba(107, 72, 255, 0.1), 0 10px 10px -5px rgba(24, 144, 255, 0.1)'
              }}
            >
              <Card className="h-full border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 mb-4 flex items-center justify-center">
                    <FeatureIcon type={feature.icon} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 用户场景强化 - 优雅简洁版 */}
      <section className="relative z-10 px-8 py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00C4A3]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            虚拟商品卖家的黄金搭档
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-red-100 dark:border-red-900/20">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6 text-[#FF6B35] border-b border-gray-200 dark:border-gray-600 pb-3">传统痛点</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={16} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">截图模糊难辨认</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">客户需要放大查看，体验极差</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={16} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">客户反复询问文件细节</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">沟通成本高，客服压力大</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={16} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">手动整理目录耗时</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">每次更新都需重新制作</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaExclamationTriangle className="text-red-500 dark:text-red-400" size={16} />
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">担心展示过多信息</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">隐私与展示难以平衡</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden border border-green-100 dark:border-green-900/20">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-6 text-[#00C4A3] border-b border-gray-200 dark:border-gray-600 pb-3">我们的解决方案</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaCheck className="text-green-500 dark:text-green-400" size={16} />
                    </div>
                    <div className="ml-4 w-full">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">自动生成清晰结构树</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div className="bg-[#00C4A3] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaCheck className="text-green-500 dark:text-green-400" size={16} />
                    </div>
                    <div className="ml-4 w-full">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">支持自助查询与检索</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div className="bg-[#00C4A3] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaCheck className="text-green-500 dark:text-green-400" size={16} />
                    </div>
                    <div className="ml-4 w-full">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                        <span className="bg-[#FF6B35] text-white px-2 py-0.5 text-xs rounded-md mr-2">3秒</span>
                        生成可分享链接
                      </h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div className="bg-[#00C4A3] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <FaCheck className="text-green-500 dark:text-green-400" size={16} />
                    </div>
                    <div className="ml-4 w-full">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">仅暴露文件名不涉内容</h4>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div className="bg-[#00C4A3] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 近期规划 - 简洁版 */}
      <section className="relative z-10 px-8 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-[#6B48FF] to-[#00C4A3]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            近期规划
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                transition: { duration: 0.3 }
              }}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="h-1.5 bg-[#00C4A3]"></div>
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#F5FDFB] dark:bg-[#1C3632] rounded-full">
                    <FaCloud size={32} className="text-[#00C4A3]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">多平台扩展</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">夸克/阿里云盘接入开发中，让您的目录可视化不受平台限制。</p>
                <div className="flex justify-center">
                  <span className="inline-block bg-green-50 dark:bg-green-900/30 text-[#00C4A3] text-sm px-3 py-1 rounded-full">
                    开发中
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                transition: { duration: 0.3 }
              }}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="h-1.5 bg-[#FF6B35]"></div>
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#FFF6F2] dark:bg-[#3D2A22] rounded-full">
                    <FaPaintBrush size={32} className="text-[#FF6B35]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">自定义logo</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">自定义logo，添加店铺链接，优化seo，直达购买。</p>
                <div className="flex justify-center">
                  <span className="inline-block bg-orange-50 dark:bg-orange-900/30 text-[#FF6B35] text-sm px-3 py-1 rounded-full">
                    即将上线
                  </span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ 
                y: -8,
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)',
                transition: { duration: 0.3 }
              }}
              className="bg-white dark:bg-gray-700 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="h-1.5 bg-[#6B48FF]"></div>
              <div className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#F5F2FF] dark:bg-[#29223D] rounded-full">
                    <FaChartLine size={32} className="text-[#6B48FF]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">数据统计</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">访问数据统计看板，了解客户浏览习惯，优化您的资源结构。</p>
                <div className="flex justify-center">
                  <span className="inline-block bg-purple-50 dark:bg-purple-900/30 text-[#6B48FF] text-sm px-3 py-1 rounded-full">
                    规划中
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 注意事项声明 */}
      <section className="relative z-10 px-8 py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            注意事项声明
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-bold mb-4">内容边界</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>仅解析文件名和基础元数据</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>不获取/存储任何文件内容</strong></span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md"
            >
              <h3 className="text-xl font-bold mb-4">隐私保护</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>生成页面不含原始分享链接</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>可手动关闭文件大小等敏感信息</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 底部通栏 */}
      <footer className="relative z-10 bg-gray-100 dark:bg-gray-800 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-lg font-bold mb-4">产品</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#6B48FF]">功能介绍</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">价格方案</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">安全保障</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">企业方案</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">资源</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#6B48FF]">帮助中心</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">开发文档</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">API参考</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">常见问题</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">公司</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#6B48FF]">关于我们</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">联系方式</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">加入我们</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">合作伙伴</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">法律</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#6B48FF]">隐私政策</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">服务条款</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">Cookie政策</Link></li>
                <li><Link href="#" className="hover:text-[#6B48FF]">GDPR合规</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p>© {new Date().getFullYear()} 网盘目录查看器. 保留所有权利.</p>
      </div>
    </div>
      </footer>
    </main>
  );
} 