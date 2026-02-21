'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, GraduationCap, Mail } from 'lucide-react';
import { userService } from '@/services/api.service';
import { User } from '@/types';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const data = await userService.getInstructors();
        setInstructors(data);
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <section className="border-b bg-muted/50 py-12 sm:py-20">
        <div className="container text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Our Instructors</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Learn from experienced professionals who are passionate about sharing their knowledge.
          </p>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="container py-12">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-muted animate-pulse mb-4" />
                    <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : instructors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    {instructor.avatar ? (
                      <img
                        src={instructor.avatar}
                        alt={`${instructor.firstName || ''} ${instructor.lastName || ''}`}
                        className="w-20 h-20 rounded-full object-cover mb-4"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">
                      {instructor.firstName || ''} {instructor.lastName || ''}
                      {!instructor.firstName && !instructor.lastName && instructor.email}
                    </h3>
                    {instructor.bio && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                        {instructor.bio}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">No Instructors Yet</h2>
            <p className="text-muted-foreground mb-6">
              Our instructor team is being set up. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-12 mt-auto">
        <div className="container text-center">
          <h2 className="text-2xl font-bold mb-2">Want to Become an Instructor?</h2>
          <p className="text-muted-foreground mb-6">
            Share your expertise and help thousands of learners achieve their goals.
          </p>
          <Button asChild>
            <Link href="/contact">
              <Mail className="mr-2 h-4 w-4" />
              Get in Touch
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
