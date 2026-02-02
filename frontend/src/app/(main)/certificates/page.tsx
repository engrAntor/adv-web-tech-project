'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  Search,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { certificateService } from '@/services/api.service';
import { Certificate } from '@/types';
import { toast } from 'sonner';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
    certificate?: Certificate;
  } | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const data = await certificateService.getMyCertificates();
        setCertificates(data);
      } catch (error) {
        console.error('Failed to fetch certificates:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleVerify = async () => {
    if (!verifyCode.trim()) {
      toast.error('Please enter a certificate code');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await certificateService.verify(verifyCode);
      setVerificationResult(result);
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleShare = (certificate: Certificate) => {
    const url = `${window.location.origin}/certificates/verify?code=${certificate.certificateCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Certificate link copied to clipboard!');
  };

  const handleDownload = async (certificate: Certificate) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(certificateService.getDownloadUrl(certificate.id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Certificates</h1>
        <p className="text-muted-foreground">
          View and manage your earned certificates
        </p>
      </div>

      {/* Verify Certificate Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verify a Certificate</CardTitle>
          <CardDescription>
            Enter a certificate code to verify its authenticity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter certificate code (e.g., CERT-ABC123)"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button onClick={handleVerify} disabled={isVerifying}>
              {isVerifying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
          </div>

          {verificationResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              verificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {verificationResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Award className="h-5 w-5 text-red-600" />
                )}
                <span className={verificationResult.valid ? 'text-green-800' : 'text-red-800'}>
                  {verificationResult.message}
                </span>
              </div>
              {verificationResult.certificate && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>Course: {verificationResult.certificate.course?.title}</p>
                  <p>Issued: {new Date(verificationResult.certificate.issuedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{certificate.course?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {certificate.studentName}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certificate Code</span>
                    <span className="font-mono">{certificate.certificateCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued Date</span>
                    <span>{new Date(certificate.issuedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/certificates/${certificate.id}`}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(certificate)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(certificate)}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete a course to earn your first certificate!
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
