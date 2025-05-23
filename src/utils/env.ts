/**
 * 安全获取环境变量的工具函数
 * 支持多种环境变量访问方式：
 * 1. window.__ENV (自定义全局变量)
 * 2. import.meta.env (Vite)
 * 3. process.env (Create React App)
 * 
 * @param name 环境变量名称
 * @param defaultValue 默认值
 * @returns 环境变量值或默认值
 */
export const getEnvVariable = (name: string, defaultValue: string): string => {
  // 检查window对象上是否有环境变量
  if (typeof window !== 'undefined' && (window as any).__ENV && (window as any).__ENV[name]) {
    return (window as any).__ENV[name];
  }
  
  // 检查import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
    return import.meta.env[name];
  }
  
  // 检查process.env (Create React App)
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  
  return defaultValue;
};
