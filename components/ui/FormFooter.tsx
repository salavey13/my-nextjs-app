//components/ui/FormFooter.tsx

"use client";

import Link from "next/link";
import { useAppContext } from "../../context/AppContext";

const FormFooter: React.FC = () => {
  const { state } = useAppContext();
  const isRussian = state?.user?.lang === "ru";

  return (
    <div className="text-xs text-gray-600 mt-4">
      <p>
        {isRussian ? (
          <>
            Я соглашаюсь с{" "}
            <Link href="/privacy-policy" target="_blank" className="text-blue-500 hover:underline">
              политикой конфиденциальности
            </Link>{" "}
            и{" "}
            <Link href="/terms-of-service" target="_blank" className="text-blue-500 hover:underline">
              условиями использования
            </Link>{" "}
            oneSitePls. Я подтверждаю своё совершеннолетие и ответственность за размещение.
          </>
        ) : (
          <>
            I agree to the{" "}
            <Link href="/privacy-policy-en" target="_blank" className="text-blue-500 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms-of-service-en" target="_blank" className="text-blue-500 hover:underline">
              Terms of Service
            </Link>{" "}
            of oneSitePls. I confirm that I am of legal age and responsible for the placement.
          </>
        )}
      </p>
    </div>
  );
};

export default FormFooter;