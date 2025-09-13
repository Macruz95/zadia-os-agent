'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

export function LandingTestimonials() {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Software Engineer',
      avatar: '/avatars/alex.jpg',
      rating: 5,
      comment: t('landing.testimonials.alex.comment'),
    },
    {
      name: 'Sarah Johnson',
      role: 'Tech Lead',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
      comment: t('landing.testimonials.sarah.comment'),
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Full Stack Developer',
      avatar: '/avatars/marcus.jpg',
      rating: 5,
      comment: t('landing.testimonials.marcus.comment'),
    },
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.testimonials.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('landing.testimonials.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}