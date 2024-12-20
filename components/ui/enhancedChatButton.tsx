import React, { useCallback, useEffect } from 'react';
import useTelegram from '../../hooks/useTelegram';
import { Button } from './button';
import { useTheme } from '@/hooks/useTheme'

const EnhancedChatButton = () => {
  const {
    tg,
    user,
    openLink,
    showMainButton,
    hideMainButton,
    showBackButton,
    closeWebApp,
    setBottomBarColor,
    setHeaderColor,
    setBackgroundColor
  } = useTelegram();
  
  const { theme } = useTheme()

  const handleOpenChatGPT = useCallback(() => {
    openLink('https://chatgpt.com/');
  }, [openLink]);

  const handleOpenVPN = useCallback(() => {
    openLink('https://s3.amazonaws.com/psiphon/web/mjr4-p23r-puwl/download.html#direct');
  }, [openLink]);

  const handleOpenVPN2 = useCallback(() => {
    openLink('https://play.google.com/store/apps/details?id=org.bepass.oblivion&pli=1');
  }, [openLink]);

  const handleOpenGitHub = useCallback(() => {
    openLink('https://github.com/salavey13/my-nextjs-app/tree/main/components/game');
  }, [openLink]);

  const handleOpenVercel = useCallback(() => {
    openLink('https://vercel.com/salavey13s-projects/my-nextjs-app/deployments');
  }, [openLink]);

  useEffect(() => {
    if (tg) {
      showMainButton('v0.dev');
      tg.MainButton?.onClick(handleOpenChatGPT);
      tg.MainButton?.setParams({color: "#020728", text_color: "#000000"});

    }
  }, [ tg, showMainButton, handleOpenChatGPT]);
  
  return (
    <div className={`flex items-center justify-center bg-background p-2 gap-2`}>
      <Button
        onClick={handleOpenVPN}
        className="group flex flex-col items-center justify-center text-gray-400 w-36 h-18 gap-2 hover:text-blue-500 transition-all duration-300 rounded-lg transform hover:scale-110"
      >
        <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all duration-300" version="1.0" xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 80.000000 80.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="scale(2.00000,2.00000)"

fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.5912,32.866l13.68-.065,3.6968-3.483L40.4885,9.2663,37.3,5.8991,10.9677,5.5784A10.5863,10.5863,0,0,0,7.5114,9.7473l10.0562.0977L13.6045,40.8538a13.3063,13.3063,0,0,0,5.8435,1.5678Z"/>
    <path d="M23.7951,11.7427,21.6216,26.3873l9.9768-.1069,2.1379-14.5377Z"/>
    </g>
    </svg>
     <span className="text-xs mb-1 transition-all duration-300 group-hover:text-blue-500">VPN</span>
      </Button>
      <Button
        onClick={handleOpenVPN2}
        className="group flex flex-col items-center justify-center text-gray-400 w-36 h-18 gap-2 hover:text-blue-500 transition-all duration-300 rounded-lg transform hover:scale-110"
      >
        <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all duration-300" version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="192.000000pt" height="192.000000pt" viewBox="0 0 192.000000 192.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,192.000000) scale(0.100000,-0.100000)"

fill="#FFFFFF" stroke="none">
<path d="M508 1453 c-61 -64 -71 -85 -78 -173 -6 -73 -7 -74 -14 -32 -10 48
-18 52 -34 17 -17 -38 -15 -109 5 -151 l18 -36 -27 -19 c-29 -21 -53 -80 -44
-106 6 -14 10 -13 31 7 l24 23 -8 -30 c-9 -32 4 -73 25 -80 6 -2 16 11 22 29
8 26 9 12 5 -67 -8 -143 10 -172 156 -245 88 -44 88 -31 -1 18 -137 75 -162
128 -113 234 22 46 25 62 19 115 -5 50 -3 67 12 93 19 30 19 31 24 8 4 -16 14
-24 35 -26 16 -2 34 -10 40 -18 15 -21 50 -7 62 26 13 33 55 49 78 30 20 -16
19 -22 -5 -48 -11 -12 -20 -24 -20 -27 0 -10 372 -5 417 7 30 7 59 24 82 47
38 38 76 127 66 153 -7 17 -47 38 -72 38 -9 0 -31 16 -49 35 -20 22 -41 35
-57 35 -15 0 -38 12 -55 29 -50 51 -122 59 -192 21 -19 -10 -26 -8 -49 13 -14
13 -36 30 -49 36 -30 16 -93 16 -120 2 -19 -10 -22 -9 -22 9 0 11 -6 20 -13
20 -16 0 -47 -32 -47 -48 0 -6 -5 -14 -11 -18 -13 -8 -2 75 12 91 11 11 12 35
1 35 -4 0 -28 -21 -54 -47z"/>
<path d="M1302 1141 c-18 -57 -15 -87 11 -117 20 -23 33 -27 95 -32 40 -2 72
-8 72 -12 0 -4 -40 -12 -88 -17 -144 -16 -164 -40 -206 -250 -32 -162 -32
-177 -2 -196 46 -31 70 -31 92 0 32 44 162 146 186 147 17 1 31 17 56 66 32
60 34 70 29 138 l-4 73 23 -22 c33 -31 31 -9 -4 66 -29 61 -91 126 -133 141
-22 8 -22 9 11 14 l35 7 -37 16 c-21 9 -57 17 -81 17 -42 0 -44 -1 -55 -39z"/>
<path d="M540 941 c-16 -31 -12 -66 10 -86 18 -17 21 -17 45 -1 14 9 25 26 26
39 1 17 3 14 10 -10 12 -40 29 -43 29 -5 0 60 -95 109 -120 63z"/>
<path d="M966 840 c1 -66 5 -127 8 -137 6 -15 8 -14 21 4 8 12 12 28 9 36 -8
23 43 59 67 46 53 -28 -14 -139 -83 -139 -25 0 -98 -51 -98 -69 0 -11 133 4
163 19 25 12 30 11 56 -14 l29 -28 6 29 c21 103 45 280 40 302 -4 14 -16 36
-27 49 -18 19 -30 22 -106 22 l-86 0 1 -120z"/>
<path d="M766 911 c-12 -13 -16 -32 -14 -58 3 -36 5 -38 38 -38 33 0 36 2 46
45 l11 45 13 -40 c23 -72 53 -77 31 -5 -19 65 -87 93 -125 51z"/>
<path d="M1766 635 c-9 -26 -7 -32 5 -12 6 10 9 21 6 23 -2 3 -7 -2 -11 -11z"/>
<path d="M1681 475 c-53 -82 -151 -180 -229 -231 -32 -22 -68 -45 -78 -52 -10
-7 0 -3 22 8 100 47 268 211 320 312 24 46 11 32 -35 -37z"/>
<path d="M330 346 c0 -2 8 -10 18 -17 15 -13 16 -12 3 4 -13 16 -21 21 -21 13z"/>
<path d="M389 297 c15 -19 71 -61 71 -54 0 2 -19 19 -42 37 -24 19 -37 26 -29
17z"/>
<path d="M500 216 c0 -3 14 -12 30 -21 17 -9 30 -13 30 -11 0 3 -13 12 -30 21
-16 9 -30 13 -30 11z"/>
<path d="M600 161 c19 -10 46 -21 60 -25 14 -3 1 5 -29 19 -62 29 -83 33 -31
6z"/>
<path d="M1290 155 c-14 -8 -20 -14 -15 -14 6 0 21 6 35 14 14 8 21 14 15 14
-5 0 -21 -6 -35 -14z"/>
<path d="M705 120 c11 -5 27 -9 35 -9 9 0 8 4 -5 9 -11 5 -27 9 -35 9 -9 0 -8
-4 5 -9z"/>
<path d="M1178 113 c7 -3 16 -2 19 1 4 3 -2 6 -13 5 -11 0 -14 -3 -6 -6z"/>
<path d="M768 103 c6 -2 18 -2 25 0 6 3 1 5 -13 5 -14 0 -19 -2 -12 -5z"/>
<path d="M1128 103 c6 -2 18 -2 25 0 6 3 1 5 -13 5 -14 0 -19 -2 -12 -5z"/>
<path d="M823 93 c9 -2 23 -2 30 0 6 3 -1 5 -18 5 -16 0 -22 -2 -12 -5z"/>
<path d="M1073 93 c9 -2 23 -2 30 0 6 3 -1 5 -18 5 -16 0 -22 -2 -12 -5z"/>
<path d="M928 83 c17 -2 47 -2 65 0 17 2 3 4 -33 4 -36 0 -50 -2 -32 -4z"/>
</g>
</svg>
     <span className="text-xs mb-1 transition-all duration-300 group-hover:text-blue-500">VPN2</span>
        
      </Button>
      {/* <Button
        onClick={handleOpenVercel}
        className="group flex flex-col items-center justify-center text-gray-400 w-36 h-18 gap-2 hover:text-blue-500 transition-all duration-300 rounded-lg transform hover:scale-110"
      >
         <svg
          className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all duration-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 283 64"
          xmlns="http://www.w3.org/2000/svg"
        >
          
          <path 
          fill="#FFFFFF" strokeLinecap="round" strokeLinejoin="round" d="M141 16c-11 0-19 7-19 18s9 18 20 18c7 0 13-3 16-7l-7-5c-2 3-6 4-9 4-5 0-9-3-10-7h28v-3c0-11-8-18-19-18zm-9 15c1-4 4-7 9-7s8 3 9 7h-18zm117-15c-11 0-19 7-19 18s9 18 20 18c6 0 12-3 16-7l-8-5c-2 3-5 4-8 4-5 0-9-3-11-7h28l1-3c0-11-8-18-19-18zm-10 15c2-4 5-7 10-7s8 3 9 7h-19zm-39 3c0 6 4 10 10 10 4 0 7-2 9-5l8 5c-3 5-9 8-17 8-11 0-19-7-19-18s8-18 19-18c8 0 14 3 17 8l-8 5c-2-3-5-5-9-5-6 0-10 4-10 10zm83-29v46h-9V5h9zM37 0l37 64H0L37 0zm92 5-27 48L74 5h10l18 30 17-30h10zm59 12v10l-3-1c-6 0-10 4-10 10v15h-9V17h9v9c0-5 6-9 13-9z"></path>
        </svg>
       <span className="text-xs mb-1 transition-all duration-300 group-hover:text-blue-500">Vercel</span> 
      </Button>
      <Button
        onClick={handleOpenGitHub}
        className="group flex flex-col items-center justify-center text-gray-400 w-36 h-18 gap-2 hover:text-blue-500 transition-all duration-300 rounded-lg transform hover:scale-110"
      >
         <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all duration-300" width="800px" height="800px" viewBox="0 -3.5 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet">

        <g fill="#FFFFFF">

        <path d="M127.505 0C57.095 0 0 57.085 0 127.505c0 56.336 36.534 104.13 87.196 120.99 6.372 1.18 8.712-2.766 8.712-6.134 0-3.04-.119-13.085-.173-23.739-35.473 7.713-42.958-15.044-42.958-15.044-5.8-14.738-14.157-18.656-14.157-18.656-11.568-7.914.872-7.752.872-7.752 12.804.9 19.546 13.14 19.546 13.14 11.372 19.493 29.828 13.857 37.104 10.6 1.144-8.242 4.449-13.866 8.095-17.05-28.32-3.225-58.092-14.158-58.092-63.014 0-13.92 4.981-25.295 13.138-34.224-1.324-3.212-5.688-16.18 1.235-33.743 0 0 10.707-3.427 35.073 13.07 10.17-2.826 21.078-4.242 31.914-4.29 10.836.048 21.752 1.464 31.942 4.29 24.337-16.497 35.029-13.07 35.029-13.07 6.94 17.563 2.574 30.531 1.25 33.743 8.175 8.929 13.122 20.303 13.122 34.224 0 48.972-29.828 59.756-58.22 62.912 4.573 3.957 8.648 11.717 8.648 23.612 0 17.06-.148 30.791-.148 34.991 0 3.393 2.295 7.369 8.759 6.117 50.634-16.879 87.122-64.656 87.122-120.973C255.009 57.085 197.922 0 127.505 0"/>

        <path d="M47.755 181.634c-.28.633-1.278.823-2.185.389-.925-.416-1.445-1.28-1.145-1.916.275-.652 1.273-.834 2.196-.396.927.415 1.455 1.287 1.134 1.923M54.027 187.23c-.608.564-1.797.302-2.604-.589-.834-.889-.99-2.077-.373-2.65.627-.563 1.78-.3 2.616.59.834.899.996 2.08.36 2.65M58.33 194.39c-.782.543-2.06.034-2.849-1.1-.781-1.133-.781-2.493.017-3.038.792-.545 2.05-.055 2.85 1.07.78 1.153.78 2.513-.019 3.069M65.606 202.683c-.699.77-2.187.564-3.277-.488-1.114-1.028-1.425-2.487-.724-3.258.707-.772 2.204-.555 3.302.488 1.107 1.026 1.445 2.496.7 3.258M75.01 205.483c-.307.998-1.741 1.452-3.185 1.028-1.442-.437-2.386-1.607-2.095-2.616.3-1.005 1.74-1.478 3.195-1.024 1.44.435 2.386 1.596 2.086 2.612M85.714 206.67c.036 1.052-1.189 1.924-2.705 1.943-1.525.033-2.758-.818-2.774-1.852 0-1.062 1.197-1.926 2.721-1.951 1.516-.03 2.758.815 2.758 1.86M96.228 206.267c.182 1.026-.872 2.08-2.377 2.36-1.48.27-2.85-.363-3.039-1.38-.184-1.052.89-2.105 2.367-2.378 1.508-.262 2.857.355 3.049 1.398"/>

        </g>

        </svg>
        <span className="text-xs mb-1 transition-all duration-300 group-hover:text-blue-500">GitHub</span>
       
      </Button> */}
      {/*<Button
        onClick={handleOpenChatGPT}
        className="group flex flex-col items-center justify-center  items-center text-gray-400 w-36 h-24 hover:text-blue-500 transition-all duration-300 transform hover:scale-110"
      >
        <span className="text-sm mb-1 transition-all duration-300 group-hover:text-blue-500">ChatGPT</span>
        <svg className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-all duration-300" width="41" height="41" viewBox="0 0 41 41" fill="black" xmlns="http://www.w3.org/2000/svg"  role="img"><text x="-9999" y="-9999">ChatGPT</text><path d="M37.5324 16.8707C37.9808 15.5241 38.1363 14.0974 37.9886 12.6859C37.8409 11.2744 37.3934 9.91076 36.676 8.68622C35.6126 6.83404 33.9882 5.3676 32.0373 4.4985C30.0864 3.62941 27.9098 3.40259 25.8215 3.85078C24.8796 2.7893 23.7219 1.94125 22.4257 1.36341C21.1295 0.785575 19.7249 0.491269 18.3058 0.500197C16.1708 0.495044 14.0893 1.16803 12.3614 2.42214C10.6335 3.67624 9.34853 5.44666 8.6917 7.47815C7.30085 7.76286 5.98686 8.3414 4.8377 9.17505C3.68854 10.0087 2.73073 11.0782 2.02839 12.312C0.956464 14.1591 0.498905 16.2988 0.721698 18.4228C0.944492 20.5467 1.83612 22.5449 3.268 24.1293C2.81966 25.4759 2.66413 26.9026 2.81182 28.3141C2.95951 29.7256 3.40701 31.0892 4.12437 32.3138C5.18791 34.1659 6.8123 35.6322 8.76321 36.5013C10.7141 37.3704 12.8907 37.5973 14.9789 37.1492C15.9208 38.2107 17.0786 39.0587 18.3747 39.6366C19.6709 40.2144 21.0755 40.5087 22.4946 40.4998C24.6307 40.5054 26.7133 39.8321 28.4418 38.5772C30.1704 37.3223 31.4556 35.5506 32.1119 33.5179C33.5027 33.2332 34.8167 32.6547 35.9659 31.821C37.115 30.9874 38.0728 29.9178 38.7752 28.684C39.8458 26.8371 40.3023 24.6979 40.0789 22.5748C39.8556 20.4517 38.9639 18.4544 37.5324 16.8707ZM22.4978 37.8849C20.7443 37.8874 19.0459 37.2733 17.6994 36.1501C17.7601 36.117 17.8666 36.0586 17.936 36.0161L25.9004 31.4156C26.1003 31.3019 26.2663 31.137 26.3813 30.9378C26.4964 30.7386 26.5563 30.5124 26.5549 30.2825V19.0542L29.9213 20.998C29.9389 21.0068 29.9541 21.0198 29.9656 21.0359C29.977 21.052 29.9842 21.0707 29.9867 21.0902V30.3889C29.9842 32.375 29.1946 34.2791 27.7909 35.6841C26.3872 37.0892 24.4838 37.8806 22.4978 37.8849ZM6.39227 31.0064C5.51397 29.4888 5.19742 27.7107 5.49804 25.9832C5.55718 26.0187 5.66048 26.0818 5.73461 26.1244L13.699 30.7248C13.8975 30.8408 14.1233 30.902 14.3532 30.902C14.583 30.902 14.8088 30.8408 15.0073 30.7248L24.731 25.1103V28.9979C24.7321 29.0177 24.7283 29.0376 24.7199 29.0556C24.7115 29.0736 24.6988 29.0893 24.6829 29.1012L16.6317 33.7497C14.9096 34.7416 12.8643 35.0097 10.9447 34.4954C9.02506 33.9811 7.38785 32.7263 6.39227 31.0064ZM4.29707 13.6194C5.17156 12.0998 6.55279 10.9364 8.19885 10.3327C8.19885 10.4013 8.19491 10.5228 8.19491 10.6071V19.808C8.19351 20.0378 8.25334 20.2638 8.36823 20.4629C8.48312 20.6619 8.64893 20.8267 8.84863 20.9404L18.5723 26.5542L15.206 28.4979C15.1894 28.5089 15.1703 28.5155 15.1505 28.5173C15.1307 28.5191 15.1107 28.516 15.0924 28.5082L7.04046 23.8557C5.32135 22.8601 4.06716 21.2235 3.55289 19.3046C3.03862 17.3858 3.30624 15.3413 4.29707 13.6194ZM31.955 20.0556L22.2312 14.4411L25.5976 12.4981C25.6142 12.4872 25.6333 12.4805 25.6531 12.4787C25.6729 12.4769 25.6928 12.4801 25.7111 12.4879L33.7631 17.1364C34.9967 17.849 36.0017 18.8982 36.6606 20.1613C37.3194 21.4244 37.6047 22.849 37.4832 24.2684C37.3617 25.6878 36.8382 27.0432 35.9743 28.1759C35.1103 29.3086 33.9415 30.1717 32.6047 30.6641C32.6047 30.5947 32.6047 30.4733 32.6047 30.3889V21.188C32.6066 20.9586 32.5474 20.7328 32.4332 20.5338C32.319 20.3348 32.154 20.1698 31.955 20.0556ZM35.3055 15.0128C35.2464 14.9765 35.1431 14.9142 35.069 14.8717L27.1045 10.2712C26.906 10.1554 26.6803 10.0943 26.4504 10.0943C26.2206 10.0943 25.9948 10.1554 25.7963 10.2712L16.0726 15.8858V11.9982C16.0715 11.9783 16.0753 11.9585 16.0837 11.9405C16.0921 11.9225 16.1048 11.9068 16.1207 11.8949L24.1719 7.25025C25.4053 6.53903 26.8158 6.19376 28.2383 6.25482C29.6608 6.31589 31.0364 6.78077 32.2044 7.59508C33.3723 8.40939 34.2842 9.53945 34.8334 10.8531C35.3826 12.1667 35.5464 13.6095 35.3055 15.0128ZM14.2424 21.9419L10.8752 19.9981C10.8576 19.9893 10.8423 19.9763 10.8309 19.9602C10.8195 19.9441 10.8122 19.9254 10.8098 19.9058V10.6071C10.8107 9.18295 11.2173 7.78848 11.9819 6.58696C12.7466 5.38544 13.8377 4.42659 15.1275 3.82264C16.4173 3.21869 17.8524 2.99464 19.2649 3.1767C20.6775 3.35876 22.0089 3.93941 23.1034 4.85067C23.0427 4.88379 22.937 4.94215 22.8668 4.98473L14.9024 9.58517C14.7025 9.69878 14.5366 9.86356 14.4215 10.0626C14.3065 10.2616 14.2466 10.4877 14.2479 10.7175L14.2424 21.9419ZM16.071 17.9991L20.4018 15.4978L24.7325 17.9975V22.9985L20.4018 25.4983L16.071 22.9985V17.9991Z" fill="currentColor"></path></svg>
      </Button>*/}
    </div>
  );
};

export default EnhancedChatButton;
