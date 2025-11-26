'use client';

import Link from 'next/link';
import { ArrowLeft, ScrollText, CheckCircle, AlertTriangle, Ban, Scale, FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="flex-1 bg-gradient-main">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-xl shadow-purple-500/20 p-4 sm:p-6 mb-5 sm:mb-6 text-white animate-fadeInUp">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl">
              <ScrollText className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold">Terms of Service</h1>
              <p className="text-purple-100 mt-0.5 text-xs sm:text-sm">Last updated: November 26, 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-6 animate-fadeInUp">
          
          {/* Introduction */}
          <section>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Welcome to Super Tic-Tac-Toe! By accessing or using our game, you agree to be bound by these Terms of Service. 
              Please read them carefully before using the service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Acceptance of Terms</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              By creating an account or using Super Tic-Tac-Toe, you acknowledge that you have read, understood, and agree 
              to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          {/* Description of Service */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Description of Service</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-3">
              Super Tic-Tac-Toe is an online multiplayer game that offers:
            </p>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                <span>Single-player games against AI opponents of varying difficulty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                <span>Multiplayer games with friends via shared links</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                <span>Random matchmaking with other online players</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                <span>Leaderboards and game statistics tracking</span>
              </li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">User Accounts</h2>
            <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Account Creation</h3>
                <p>
                  You may play as a guest or sign in with your Google account. Signing in enables features like 
                  game history tracking, leaderboard participation, and cross-device progress sync.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Account Responsibility</h3>
                <p>
                  You are responsible for maintaining the security of your account. Any activity that occurs under 
                  your account is your responsibility.
                </p>
              </div>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Acceptable Use</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-3">
              When using Super Tic-Tac-Toe, you agree to:
            </p>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-sm sm:text-base list-disc list-inside ml-2">
              <li>Play fairly and not use any cheats, hacks, or exploits</li>
              <li>Respect other players and maintain sportsmanship</li>
              <li>Not attempt to disrupt or interfere with the service</li>
              <li>Not impersonate other users or entities</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Prohibited Activities</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-800/50">
              <p className="text-red-800 dark:text-red-200 text-sm sm:text-base mb-2">
                The following activities are strictly prohibited:
              </p>
              <ul className="space-y-1.5 text-red-700 dark:text-red-300 text-sm sm:text-base list-disc list-inside">
                <li>Using automated bots or scripts to play</li>
                <li>Exploiting bugs or vulnerabilities</li>
                <li>Attempting to access other users&apos; accounts</li>
                <li>Manipulating game outcomes or statistics</li>
                <li>Reverse engineering the game code</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Intellectual Property</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Super Tic-Tac-Toe and its original content, features, and functionality are owned by the project 
              creators and are protected by international copyright and other intellectual property laws. The game 
              is open source and available under the terms specified in the project&apos;s license.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Disclaimer</h2>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800/50">
              <p className="text-amber-800 dark:text-amber-200 text-sm sm:text-base leading-relaxed">
                The service is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any kind. We do not 
                guarantee that the service will be uninterrupted, secure, or error-free. Use of the service is at 
                your own risk.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Limitation of Liability</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              To the maximum extent permitted by law, the creators of Super Tic-Tac-Toe shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages arising from your use of the service.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Termination</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              We reserve the right to terminate or suspend your access to the service at any time, without prior 
              notice, for conduct that we believe violates these Terms of Service or is harmful to other users, 
              us, or third parties, or for any other reason.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Changes to Terms</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              We may modify these Terms of Service at any time. We will notify users of any material changes by 
              updating the &quot;Last updated&quot; date. Your continued use of the service after such modifications 
              constitutes your acceptance of the updated terms.
            </p>
          </section>

          {/* Contact */}
          <section className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Contact</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              If you have any questions about these Terms of Service, please contact us through our GitHub repository 
              or reach out to the project maintainers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
