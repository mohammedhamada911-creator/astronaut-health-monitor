import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// قاعدة نسبية حتى يعمل الموقع على أي استضافة (نطاق مستقل أو مسار فرعي).
export default defineConfig({
  base: './',
  plugins: [react()],
});
