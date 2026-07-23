import { useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { SEO } from '@/components/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Contact() {
  const [state, handleSubmit, reset] = useForm('mvzebngw');
  const { toast } = useToast();

  // Success effect
  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: 'Message sent successfully.',
        description: 'Thanks for contacting QuickAway.',
        duration: 5000,
      });
      reset();
    }
  }, [state.succeeded, toast, reset]);

  // Error effect
  useEffect(() => {
    if (state.errors && state.errors.length > 0 && !state.submitting) {
      toast({
        title: 'Something went wrong.',
        description: 'Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [state.errors, state.submitting, toast]);

  return (
    <>
      <SEO
        title="Contact Us - QuickAway"
        description="Get in touch with the QuickAway team. Request new tools, report bugs, or just say hello."
      />

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Get in touch</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a suggestion for a new tool? Found a bug? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Feedback
                </CardTitle>
                <CardDescription>Tell us how we can improve.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bug reports, broken tools, or anything that feels off — let us know and we'll take a look.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Tool Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Missing a tool you'd actually use? Tell us what it is and we'll consider it for the next release.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Jane Doe"
                        required
                        disabled={state.submitting}
                      />
                      <ValidationError field="name" prefix="Name" errors={state.errors} className="text-xs text-destructive" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="jane@example.com"
                        required
                        disabled={state.submitting}
                      />
                      <ValidationError field="email" prefix="Email" errors={state.errors} className="text-xs text-destructive" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Tool Request: Currency Converter"
                      required
                      minLength={3}
                      disabled={state.submitting}
                    />
                    <ValidationError field="subject" prefix="Subject" errors={state.errors} className="text-xs text-destructive" />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="I would love a tool that..."
                      rows={6}
                      required
                      minLength={10}
                      className="resize-none"
                      disabled={state.submitting}
                    />
                    <ValidationError field="message" prefix="Message" errors={state.errors} className="text-xs text-destructive" />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto" disabled={state.submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {state.submitting ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
