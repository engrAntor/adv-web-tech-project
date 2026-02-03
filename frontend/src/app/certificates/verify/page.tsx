'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Award,
  Download,
  Share2,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  BookOpen,
  Search,
  Linkedin,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { certificateService, PublicCertificate } from '@/services/api.service';
import { toast } from 'sonner';

// Wrap the main content in Suspense for useSearchParams
export default function CertificateVerifyPage() {
  return (
    <Suspense fallback={<CertificateVerifyLoading />}>
      <CertificateVerifyContent />
    </Suspense>
  );
}

function CertificateVerifyLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function CertificateVerifyContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code');

  const [code, setCode] = useState(codeFromUrl || '');
  const [certificate, setCertificate] = useState<PublicCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (codeFromUrl) {
      handleVerify(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleVerify = async (certificateCode?: string) => {
    const codeToVerify = certificateCode || code;
    if (!codeToVerify.trim()) {
      toast.error('Please enter a certificate code');
      return;
    }

    setIsLoading(true);
    setIsSearched(true);
    setError(null);
    setCertificate(null);

    try {
      const data = await certificateService.getPublicCertificate(codeToVerify);
      setCertificate(data);
    } catch (err: any) {
      console.error('Verification failed:', err);
      if (err.response?.status === 404) {
        setError('Certificate not found. Please check the code and try again.');
      } else {
        setError('Failed to verify certificate. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const handleShareLinkedIn = () => {
    const url = window.location.href;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleDownload = async () => {
    if (!certificate) return;

    try {
      const response = await fetch(certificateService.getPublicDownloadUrl(certificate.certificateCode));

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certificate.certificateCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Certificate downloaded!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download certificate');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">LMS Platform</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/login">
              <ExternalLink className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-muted-foreground">
            Verify the authenticity of a certificate issued by LMS Platform
          </p>
        </div>

        {/* Search Box */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter certificate code (e.g., CERT-ABC123)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="text-lg"
              />
              <Button onClick={() => handleVerify()} disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Verify
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Invalid Certificate</h2>
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Certificate Display */}
        {certificate && !isLoading && (
          <Card className="overflow-hidden">
            {/* Validity Banner */}
            <div className={`px-6 py-3 flex items-center justify-center gap-2 ${
              certificate.isValid
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              {certificate.isValid ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">This certificate is valid and authentic</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">This certificate has expired</span>
                </>
              )}
            </div>

            {/* Certificate Preview */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 md:p-12">
              <div className="max-w-3xl mx-auto text-center">
                {/* Header */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Award className="h-8 w-8" />
                  <span className="text-lg font-semibold tracking-wider">LMS PLATFORM</span>
                </div>

                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-bold mb-2">CERTIFICATE</h2>
                <p className="text-blue-200 text-lg mb-8">OF COMPLETION</p>

                {/* Divider */}
                <div className="w-32 h-1 bg-blue-400 mx-auto mb-8"></div>

                {/* Content */}
                <p className="text-blue-100 mb-4">This is to certify that</p>
                <h3 className="text-3xl md:text-4xl font-bold mb-2">
                  {certificate.studentName}
                </h3>
                <div className="w-64 h-px bg-blue-400 mx-auto mb-6"></div>

                <p className="text-blue-100 mb-4">has successfully completed the course</p>
                <h4 className="text-2xl md:text-3xl font-semibold mb-8">
                  {certificate.courseName}
                </h4>

                {/* Date */}
                <p className="text-blue-200">
                  Issued on {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                {/* Certificate Code */}
                <div className="mt-6 inline-block bg-white/10 rounded-lg px-4 py-2">
                  <span className="text-sm text-blue-200">Certificate ID: </span>
                  <span className="font-mono font-semibold">{certificate.certificateCode}</span>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              {/* Certificate Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Recipient</p>
                      <p className="font-medium">{certificate.studentName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-medium">{certificate.courseName}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Issue Date</p>
                      <p className="font-medium">
                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {certificate.instructorName && (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Instructor</p>
                        <p className="font-medium">{certificate.instructorName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>

                <Button variant="outline" onClick={handleShareLinkedIn}>
                  <Linkedin className="mr-2 h-4 w-4" />
                  Share on LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initial State (no search yet) */}
        {!isSearched && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Enter a Certificate Code</h2>
              <p className="text-muted-foreground">
                Enter the certificate code above to verify its authenticity.
                The code can be found on the certificate document.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LMS Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
