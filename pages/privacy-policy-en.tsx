import React from "react";
import Footer from "../components/ui/footer";
import { Inter } from "next/font/google";
import "../app/globals.css";

const inter = Inter({ subsets: ["latin"] });
const PrivacyPolicyEn = () => {
  return (
    <div className="container mx-auto p-6 bg-gray-200 text-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold mb-6 text-teal-400">Privacy Policy</h1>
      <p className="text-sm text-gray-400"><strong>Effective date: </strong>August 4, 2024</p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Information we collect</h2>
      <p className="mt-4 text-lg text-gray-300">
        When using the oneSitePlsBot Bot, we collect the following information:
        Your Telegram Username
        We do not collect any other personal information.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">How we use your information</h2>
      <p className="mt-4 text-lg text-gray-300">
        Your Telegram username is used to manage your betting activity and track your participation. Content submitted through the Bot may be stored and used for further development, analysis and other purposes.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Data security</h2>
      <p className="mt-4 text-lg text-gray-300">
        We use appropriate technical and organizational measures to protect your data from unauthorized access, loss or misuse.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Data exchange</h2>
      <p className="mt-4 text-lg text-gray-300">
        We do not share your data with third parties, except when necessary for the operation of the Bot or as required by law.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Your rights</h2>
      <p className="mt-4 text-lg text-gray-300">
        You may request deletion of your data or discontinue use of the Bot at any time by contacting us at <span className="text-teal-400">@salavey13</span>.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Changes to the Privacy Policy</h2>
      <p className="mt-4 text-lg text-gray-300">
        We may update this Privacy Policy from time to time. Please review it regularly to stay informed of changes.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Contact us</h2>
      <p className="mt-4 text-lg text-gray-300">
If you have any questions about this Privacy Policy, please contact us at <span className="text-teal-400">@salavey13</span>.
      </p>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyEn;