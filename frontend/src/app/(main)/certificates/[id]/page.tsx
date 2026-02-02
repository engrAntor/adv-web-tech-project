'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Award,
  Download,
  Share2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Linkedin,
} from 'lucide-react';
import { certificateService } from '@/services/api.service';
import { Certificate } from '@/types';
import { toast } from 'sonner';

export default function CertificateViewPage() {
  const params = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const data = await certificateService.getById(Number(params.id));
        setCertificate(data);
      } catch (error) {
        console.error('Failed to fetch certificate:', error);
        toast.error('Certificate not found');
        router.push('/certificates');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCertificate();
    }
  }, [params.id, router]);

  const handleShare = () => {
    if (!certificate) return;
    const url = `${window.location.origin}/certificates/verify?code=${certificate.certificateCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Certificate link copied to clipboard!');
  };

  const handleShareLinkedIn = () => {
    if (!certificate) return;
    const url = `${window.location.origin}/certificates/verify?code=${certificate.certificateCode}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleDownload = async () => {
    if (!certificate) return;

    setIsDownloading(true);
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
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!certificate) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/certificates">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificate Details</h1>
          <p className="text-muted-foreground">View and share your certificate</p>
        </div>
      </div>

      {/* Certificate Preview Card */}
      <Card className="overflow-hidden">
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
              {certificate.studentName || certificate.user?.email}
            </h3>
            <div className="w-64 h-px bg-blue-400 mx-auto mb-6"></div>

            <p className="text-blue-100 mb-4">has successfully completed the course</p>
            <h4 className="text-2xl md:text-3xl font-semibold mb-8">
              {certificate.course?.title}
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
                  <p className="font-medium">{certificate.studentName || certificate.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-medium">{certificate.course?.title}</p>
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

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium text-green-600">Valid</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
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

            <Button variant="outline" asChild>
              <Link href={`/certificates/verify?code=${certificate.certificateCode}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
