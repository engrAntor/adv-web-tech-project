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
      <section className="border-b bg-muted/50 py-8 sm:py-12 md:py-20">
        <div className="container px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full mb-3 sm:mb-4">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Our Instructors</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Learn from experienced professionals who are passionate about sharing their knowledge.
          </p>
        </div>
      </section>

      {/* Instructors Grid */}
      <section className="container px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted animate-pulse mb-3 sm:mb-4" />
                    <div className="h-5 w-32 bg-muted animate-pulse rounded mb-2" />
                    <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : instructors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {instructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-5 sm:pt-6">
                  <div className="flex flex-row sm:flex-col items-center sm:text-center gap-4 sm:gap-0">
                    {instructor.avatar ? (
                      <img
                        src={instructor.avatar}
                        alt={`${instructor.firstName || ''} ${instructor.lastName || ''}`}
                        className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover sm:mb-4 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center sm:mb-4 shrink-0">
                        <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg truncate">
                        {instructor.firstName || ''} {instructor.lastName || ''}
                        {!instructor.firstName && !instructor.lastName && instructor.email}
                      </h3>
                      {instructor.bio && (
                        <p className="text-muted-foreground text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3">
                          {instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground/50" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">No Instructors Yet</h2>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              Our instructor team is being set up. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/50 py-8 sm:py-12 mt-auto">
        <div className="container px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Want to Become an Instructor?</h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-6">
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
