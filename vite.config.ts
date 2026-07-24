import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const normalizeId = (id: string) => id.replace(/\\/g, '/');

function manualChunks(id: string): string | undefined {
  const normalized = normalizeId(id);

  if (normalized.includes('node_modules')) {
    if (normalized.includes('react-pdf') || normalized.includes('pdfjs-dist')) {
      return 'vendor-pdf';
    }
    if (normalized.includes('react-datepicker') || normalized.includes('date-fns')) {
      return 'vendor-datepicker';
    }
    if (normalized.includes('react-phone-input-2') || normalized.includes('libphonenumber-js')) {
      return 'vendor-phone';
    }
    if (normalized.includes('quill')) {
      return 'vendor-quill';
    }
    if (normalized.includes('react-select')) {
      return 'vendor-react-select';
    }
    if (normalized.includes('framer-motion')) {
      return 'vendor-framer-motion';
    }
    if (normalized.includes('react-icons')) {
      return 'vendor-react-icons';
    }
    if (normalized.includes('lodash')) {
      return 'vendor-lodash';
    }
    if (normalized.includes('moment')) {
      return 'vendor-moment';
    }
    if (normalized.includes('formik') || normalized.includes('yup')) {
      return 'vendor-form';
    }
    if (
      normalized.includes('@reduxjs/toolkit')
      || normalized.includes('react-redux')
      || normalized.includes('redux-state-sync')
    ) {
      return 'vendor-redux';
    }
    if (normalized.includes('react-dom') || normalized.includes('/react/')) {
      return 'vendor-react';
    }
    if (normalized.includes('@tanstack/react-table')) {
      return 'vendor-tanstack-table';
    }
    return undefined;
  }

  if (normalized.includes('components/ui/input/dateInput')) {
    return 'ui-date-input';
  }

  if (normalized.includes('components/ui/input/dateTimePicker')) {
    return 'ui-datetime-picker';
  }

  if (normalized.includes('components/ui/input/timePicker')) {
    return 'ui-time-picker';
  }

  if (normalized.includes('components/ui/input/phoneInput')) {
    return 'ui-phone';
  }

  if (normalized.includes('components/ui/textEditor')) {
    return 'ui-editor';
  }

  if (normalized.includes('components/ui/input/fileInput/PdfPreview')) {
    return 'vendor-pdf';
  }

  if (normalized.includes('components/ui/input/fileInput')) {
    return 'ui-file';
  }

  if (normalized.includes('components/ui/input/SelectDropdown')) {
    return 'ui-select';
  }

  // Avoid a single catch-all ui chunk — let Rolldown split shared light UI naturally.
  return undefined;
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/react-ts-vite-tailwind-template/' : '/',
  plugins: [react()],
  assetsInclude: ['**/*.avif', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg'],
  server: {
    port: 3000,
    host: true, // This enables network access (IP)
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
});
