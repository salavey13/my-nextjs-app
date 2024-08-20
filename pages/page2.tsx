import React from "react";
import Link from "next/link";
const TermsOfServiceEn = () => {
  return (
    <div className="container mx-auto p-6 bg-gray-200 text-white rounded-lg shadow-lg">
      <h1 className="text-4xl font-extrabold mb-6 text-teal-400">Terms of use</h1>
      <p className="text-sm text-gray-400"><strong>Effective date:</strong> August 4, 2024
.</p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Introduction</h2>
      <p className="mt-4 text-lg text-gray-300">
        By using oneSitePlsBot (“Bot”), you agree to these Terms of Use (“Terms”). If you do not agree to these Terms, please stop using the Bot.
      </p>
<h2 className="text-3xl font-semibold mt-8 text-teal-300">Usage</h2>
      <p className="mt-4 text-lg text-gray-300">
        The bot allows you to participate in bets related to current events and fight hostile elements such as quilts through a credit betting system.
All bets and interactions take place in credits, simplifying the process and eliminating the need for real money transactions.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Bets and Settlement</h2>
      <p className="mt-4 text-lg text-gray-300">
        Bets are placed in credits,
which have no monetary equivalent. When the outcome of events is determined, a notification is sent to losing users asking them to transfer credits to a common bank. Losers may refuse to pay, but thereby lose the respect of the community. The remaining credits are redistributed among the winners in proportion to their bets.
      </p>
<h2 className="text-3xl font-semibold mt-8 text-teal-300">Fight against Vatnik</h2>
      <p className="mt-4 text-lg text-gray-300">
        The bot maintains active participation in the fight against disinformation and hostile elements. By participating in bets, you not only get the opportunity to win credits, but also contribute to the common cause,
supporting truth and freedom.
      </p>

      <h2 className="text-3xl font-semibold mt-8 text-teal-300">Changes to the Terms</h2>
      <p className="mt-4 text-lg text-gray-300">
        We may update these Terms from time to time. Please review them regularly to stay informed of changes.
      </p>

      <h2 className="text-
3xl font-semibold mt-8 text-teal-300">Contact us</h2>
      <p className="mt-4 text-lg text-gray-300">
        If you have any questions about these Terms, please contact us at <span className="text-teal-400">@salavey13</span>.
      </p>
      <footer className="bg-gray-800 text-gray-400 p-4">
        <div className="flex justify-between">
        <Link href="/" className="text-sm">✨</Link>
          <Link href="/privacy-policy" className="text-sm">Политика конфиденциальности</Link>
          <Link href="/terms-of-service" className="text-sm">Условия использования</Link>
          <Link href="/page1" className="text-sm">Privacy Policy</Link>
          <Link href="/page2" className="text-sm">Terms of Service</Link>
          {/* Add more links as needed */}
        </div>
      </footer>
    </div>
  );
};

export default TermsOfServiceEn;