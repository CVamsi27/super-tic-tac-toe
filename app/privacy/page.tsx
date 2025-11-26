'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-xl shadow-blue-500/20 p-4 sm:p-6 mb-5 sm:mb-6 text-white animate-fadeInUp">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-white/20 rounded-xl sm:rounded-2xl">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold">Privacy Policy</h1>
              <p className="text-blue-100 mt-0.5 text-xs sm:text-sm">Last updated: November 26, 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 space-y-6 animate-fadeInUp">
          
          {/* Introduction */}
          <section>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Welcome to Super Tic-Tac-Toe. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our game.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Information We Collect</h2>
            </div>
            <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Account Information</h3>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Name and email address (via Google Sign-In)</li>
                  <li>Profile picture (if provided by Google)</li>
                  <li>Unique user identifier</li>
                </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Game Data</h3>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Game history and statistics (wins, losses, draws)</li>
                  <li>Points and leaderboard rankings</li>
                  <li>Game duration and timestamps</li>
                </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 sm:p-4">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Technical Data</h3>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>Browser type and version</li>
                  <li>Device information</li>
                  <li>IP address (for connection purposes)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">How We Use Your Information</h2>
            </div>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span>To provide and maintain the game service</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span>To authenticate your identity and manage your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span>To track game statistics and display leaderboards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span>To enable multiplayer functionality and matchmaking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span>To improve and optimize the game experience</span>
              </li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Data Security</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              We implement appropriate security measures to protect your personal information. Your data is transmitted 
              securely using encryption, and we use industry-standard practices to safeguard your information. However, 
              no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Your Rights</h2>
            </div>
            <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base space-y-2">
              <p>You have the right to:</p>
              <ul className="space-y-1.5 list-disc list-inside ml-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent at any time by logging out</li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">Third-Party Services</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              We use Google Sign-In for authentication. When you sign in with Google, their privacy policy also applies. 
              We recommend reviewing{' '}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Google&apos;s Privacy Policy
              </a>{' '}
              to understand how they handle your data.
            </p>
          </section>

          {/* Contact */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">Contact Us</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us through our GitHub repository or 
              reach out to the project maintainers.
            </p>
          </section>

          {/* Changes */}
          <section className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
