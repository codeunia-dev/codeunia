"use client";

import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface MembershipCardProps {
  uid: string;
}

const MembershipCard: React.FC<MembershipCardProps> = ({ uid }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const memberId = `CU-${uid.slice(-4)}`;

  const handleDownload = async () => {
    if (pdfContentRef.current) {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${memberId}-membership-card.pdf`);
    }
  };

  return (
    <>
      {/* Hidden PDF Content - Only visible when generating PDF */}
      <div 
        ref={pdfContentRef} 
        className="fixed -left-[9999px] top-0 bg-white"
        style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}
      >
        {/* PDF Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold text-purple-600">CodeUnia</h1>
          </div>
          <p className="text-xl text-blue-600 font-semibold mb-2">CodeUnia members achieve great things</p>
        </div>

        {/* Thank You Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-2">THANK YOU</h2>
          <p className="text-sm text-yellow-600 font-semibold mb-4">FOR YOUR MEMBERSHIP</p>
          
          <p className="text-sm text-gray-700 mb-4">
            You are a member of the CodeUnia Community.
          </p>
          
          <p className="text-sm text-gray-700 mb-6">
            Below is a digital version of your membership card for easy access to your membership 
            information. You can also access this in your CodeUnia Profile or in the CodeUnia app anytime!
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
          <div>
            <h3 className="font-bold text-blue-600 mb-2">Local CodeUnia Community</h3>
            <p className="text-gray-700 mb-4">
              Get involved with colleagues at your local CodeUnia Community, 
              who can help connect you to professionals who can advance your goals.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Technical Publications</h4>
            <p className="text-gray-700 mb-4">
              Take advantage of discounts and access to cutting-edge journals, magazines, and 
              digital publications.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Professional Network</h4>
            <p className="text-gray-700">
              Build a professional network from the wealth of university expertise and connections 
              found within CodeUnia.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-blue-600 mb-2">Local CodeUnia Student Branch</h3>
            <p className="text-gray-700 mb-4">
              Join and enjoy exciting technical competitions, expert speakers, 
              professional networking, and colleagues for life.
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Career Opportunities</h4>
            <p className="text-gray-700 mb-4">
              Drive your career goals forward with online learning, 
              job listings, a consultants network, and more!
            </p>
            
            <h4 className="font-bold text-blue-600 mb-1">Local Activities</h4>
            <p className="text-gray-700">
              Through your local CodeUnia community, events and conferences - 
              there are many ways to become involved.
            </p>
          </div>
        </div>

        {/* Membership Card in PDF */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg border border-gray-300" style={{ width: '420px', height: '250px' }}>
            <div className="flex h-full">
              {/* Left Section - Member Info */}
              <div className="flex-1 p-4 bg-gradient-to-br from-gray-50 to-white rounded-l-lg">
                {/* Student Member Badge */}
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                    STUDENT MEMBER
                  </span>
                </div>

                {/* CodeUnia Title */}
                <div className="mb-4">
                  <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                    code unia
                  </h1>
                </div>

                {/* Member ID */}
                <div className="mb-3">
                  <div className="text-sm text-gray-600">Member ID: 
                    <span className="text-blue-600 font-mono font-bold">{memberId}</span>
                  </div>
                </div>

                {/* Status and Year */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded border border-green-200">
                    Active Member
                  </span>
                  <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded border border-yellow-200">
                    2025
                  </span>
                </div>

                {/* Validity Info */}
                <div className="text-xs text-gray-600">
                  <div>Valued Codeunia Member for 1 Year</div>
                  <div className="font-semibold">Valid through 31 December 2025</div>
                </div>
              </div>

              {/* Right Section - Purple Background with Logo */}
              <div className="w-36 bg-gradient-to-br from-purple-600 to-purple-800 p-4 flex flex-col items-center justify-center text-white relative rounded-r-lg">
                {/* Logo Circle */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>

                {/* CodeUnia Text */}
                <div className="text-center mb-4">
                  <h2 className="text-sm font-bold tracking-wide">CodeUnia</h2>
                  <p className="text-xs text-purple-200 mt-1">Empowering Coders</p>
                </div>

                {/* Footer */}
                <div className="absolute bottom-3 left-2 right-2 text-center">
                  <div className="text-xs text-purple-200 mb-1">Powered by Codeunia</div>
                  <div className="text-xs text-purple-300">support@codeunia.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-600 mt-8">
          <p className="mb-2">
            <span className="font-semibold">Make the Most of Your Membership.</span> Learn about these and all CodeUnia member benefits at{' '}
            <span className="text-blue-600 font-semibold">codeunia.com/benefits</span>
          </p>
        </div>
      </div>

      {/* Visible Card for Display */}
      <div className="flex flex-col items-center p-8">
        {/* Main Card */}
        <div className="relative transform hover:scale-[1.02] transition-all duration-300 ease-out">
          <div
            ref={cardRef}
            className="flex bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden w-[500px] h-[300px]"
          >
            {/* Left Section - Member Info */}
            <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-white">
              {/* Student Member Badge */}
              <div className="mb-4">
                <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                  STUDENT MEMBER
                </span>
              </div>

              {/* CodeUnia Title */}
              <div className="mb-6">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  code unia
                </h1>
              </div>

              {/* Member ID */}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-1">Member ID: 
                  <span className="text-blue-600 font-mono font-bold">{memberId}</span>
                </div>
              </div>

              {/* Status and Year */}
              <div className="flex items-center gap-4 mb-6">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md border border-green-200">
                  Active Member
                </span>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-md border border-yellow-200">
                  2025
                </span>
              </div>

              {/* Validity Info */}
              <div className="text-xs text-gray-600 mb-2">
                <div>Valued Codeunia Member for 1 Year</div>
                <div className="font-semibold">Valid through 31 December 2025</div>
              </div>
            </div>

            {/* Right Section - Purple Background with Logo */}
            <div className="w-48 bg-gradient-to-br from-purple-600 to-purple-800 p-6 flex flex-col items-center justify-center text-white relative">
              {/* Logo Circle */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>

              {/* CodeUnia Text */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold tracking-wide">CodeUnia</h2>
                <p className="text-sm text-purple-200 mt-1">Empowering Coders</p>
              </div>

              {/* Footer */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="text-xs text-purple-200 mb-1">Powered by Codeunia</div>
                <div className="text-xs text-purple-300">support@codeunia.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-8">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Card
            </div>
          </button>
        </div>
      </div>
    </>
  );
};

export default MembershipCard;
