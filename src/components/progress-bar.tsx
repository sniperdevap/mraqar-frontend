'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';

// Custom CSS for nprogress
const nprogressStyles = `
  #nprogress {
    pointer-events: none;
  }

  #nprogress .bar {
    background: #FB6B5B;
    position: fixed;
    z-index: 1031;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
  }

  #nprogress .peg {
    display: block;
    position: absolute;
    right: 0px;
    width: 100px;
    height: 100%;
    box-shadow: 0 0 10px #0ea5e9, 0 0 5px #0ea5e9;
    opacity: 1;
    transform: rotate(3deg) translate(0px, -4px);
  }

  #nprogress .spinner {
    display: block;
    position: fixed;
    z-index: 1031;
    top: 15px;
    right: 15px;
  }

  #nprogress .spinner-icon {
    width: 18px;
    height: 18px;
    box-sizing: border-box;
    border: solid 2px transparent;
    border-top-color: #0ea5e9;
    border-left-color: #0ea5e9;
    border-radius: 50%;
    animation: nprogress-spinner 400ms linear infinite;
  }

  .nprogress-custom-parent {
    overflow: hidden;
    position: relative;
  }

  .nprogress-custom-parent #nprogress .spinner,
  .nprogress-custom-parent #nprogress .bar {
    position: absolute;
  }

  @keyframes nprogress-spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default function ProgressBar() {
  const router = useRouter();

  useEffect(() => {
    // Configure NProgress
    NProgress.configure({
      minimum: 0.3,
      easing: 'ease',
      speed: 800,
      showSpinner: false,
    });

    // Inject custom styles
    const style = document.createElement('style');
    style.innerHTML = nprogressStyles;
    document.head.appendChild(style);

    let timeout: NodeJS.Timeout;

    const handleStart = () => {
      timeout = setTimeout(() => NProgress.start(), 100);
    };

    const handleComplete = () => {
      clearTimeout(timeout);
      NProgress.done();
    };

    // Listen to route changes
    const originalPush = router.push;
    const originalReplace = router.replace;
    const originalBack = router.back;
    const originalForward = router.forward;

    router.push = (...args) => {
      handleStart();
      const result = originalPush.apply(router, args);
      setTimeout(handleComplete, 100);
      return result;
    };

    router.replace = (...args) => {
      handleStart();
      const result = originalReplace.apply(router, args);
      setTimeout(handleComplete, 100);
      return result;
    };

    router.back = () => {
      handleStart();
      originalBack();
      setTimeout(handleComplete, 100);
    };

    router.forward = () => {
      handleStart();
      originalForward();
      setTimeout(handleComplete, 100);
    };

    // Clean up on unmount
    return () => {
      clearTimeout(timeout);
      NProgress.remove();
      document.head.removeChild(style);

      // Restore original methods
      router.push = originalPush;
      router.replace = originalReplace;
      router.back = originalBack;
      router.forward = originalForward;
    };
  }, [router]);

  return null;
}
