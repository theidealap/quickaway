import { useState, type FormEvent } from 'react';
import { SEO } from '@/components/seo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MessageSquare, Send, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactFormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const initialFormState: ContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export default function Contact() {
  const [form, setForm] = useState<ContactFormState>(initialFormState);
  const { toast } = useToast();

  const updateField = (field: keyof ContactFormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Native HTML5 validation (required fields, email format) runs first.
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    // NOTE for future integration: this is where the form payload (`form`)
    // should be sent to a backend endpoint / email service once one is
    // connected. No message is transmitted or stored anywhere yet.
    toast({
      title: 'Contact system coming soon',
      description:
        "Our contact system is currently being finalized, so this message wasn't sent anywhere yet. Please check back soon.",
      duration: 5000,
    });

    setForm(initialFormState);
  };

  return (
    <>
      <SEO
        title="Contact Us - ToolBox"
        description="Get in touch with the ToolBox team. Request new tools, report bugs, or just say hello."
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
                  We're always looking to make ToolBox better. Whether it's a UI tweak or a whole new category of tools, your feedback drives our roadmap.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  What to Expect
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our contact system is currently being finalized. Submit the form and we'll be able to follow up directly once it's live.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
                <CardDescription>
                  Fill out the form below. We're finishing up our messaging system, so replies aren't automatic yet — but every message helps shape what we build next.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Contact system being finalized</AlertTitle>
                  <AlertDescription>
                    Message delivery isn't connected yet, so submissions aren't sent or stored right now. Thanks for your patience while we finish setting this up.
                  </AlertDescription>
                </Alert>

                <form className="space-y-4" onSubmit={handleSubmit} noValidate={false}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        placeholder="Jane Doe"
                        required
                        value={form.name}
                        onChange={updateField('name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="jane@example.com"
                        required
                        value={form.email}
                        onChange={updateField('email')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      placeholder="Tool Request: Currency Converter"
                      required
                      minLength={3}
                      value={form.subject}
                      onChange={updateField('subject')}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      placeholder="I would love a tool that..."
                      rows={6}
                      required
                      minLength={10}
                      className="resize-none"
                      value={form.message}
                      onChange={updateField('message')}
                    />
                  </div>

                  <Button type="submit" className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
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
