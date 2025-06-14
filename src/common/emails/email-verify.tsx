import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Text,
  Button,
  Section,
} from '@react-email/components';



const EmailVerify = ({
  username = 'User',
  verificationUrl = ""
}) => {
  return (
    <Html>
      <Head />
      <Preview>Verify your Account</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={{ marginBottom: '32px' }}>
            <Text style={styles.logo}>OneStore 🛍️</Text>
            <Text style={styles.heading}>Verify Your Email Address</Text>
            <Text style={styles.paragraph}>
              Hi {username},
            </Text>
            <Text style={styles.paragraph}>
              Thanks for joining OneStore! To complete your registration and activate your account, please click the button below to verify your email address.
            </Text>
            <Button style={styles.button} href={verificationUrl}>
              Verify Email
            </Button>
            <Text style={styles.paragraph}>
              If the button above doesn&apos;t work, you can copy and paste the following link into your web browser:
            </Text>
            <Text style={styles.link}>{verificationUrl}</Text>
          </Section>
          <Section style={styles.footerSection}>
            <Text style={styles.footer}>
              &copy; {new Date().getFullYear()} OneStore. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};


const styles = {
  body: {
    backgroundColor: 'oklch(0.1776 0 0)',
    fontFamily: 'var(--font-sans, "Space Grotesk", sans-serif)',
    padding: '20px',
    lineHeight: '1.6',
  },
  container: {
    backgroundColor: 'oklch(0.2134 0 0)',
    border: '1px solid oklch(0.2351 0.0115 91.7467)',
    borderRadius: 'var(--radius, 0.5rem)',
    padding: '40px',
    maxWidth: '550px',
    margin: '0 auto',
    boxShadow: 'var(--shadow-lg)',
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: 'oklch(0.9491 0 0)',
    textAlign: 'center' as const,
    marginBottom: '25px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: 'oklch(0.9491 0 0)',
    margin: '0 0 20px',
    textAlign: 'center' as const,
  },
  paragraph: {
    fontSize: '15px',
    color: 'oklch(0.9491 0 0)',
    margin: '15px 0',
  },
  button: {
    display: 'block',
    width: 'fit-content',
    backgroundColor: 'oklch(0.9247 0.0524 66.1732)',
    color: 'oklch(0.2029 0.0240 200.1962)',
    fontWeight: 'bold',
    fontFamily: 'var(--font-sans, "Space Grotesk", sans-serif)',
    padding: '14px 28px',
    borderRadius: 'var(--radius, 0.5rem)',
    textDecoration: 'none',
    margin: '30px auto',
    textAlign: 'center' as const,
  },
  link: {
    fontSize: '13px',
    color: 'oklch(0.7699 0 0)',
    wordBreak: 'break-word',
    margin: '10px 0',
    textDecoration: 'underline',
  } as const,
  footerSection: {
    borderTop: '1px solid oklch(0.2351 0.0115 91.7467)',
    marginTop: '40px',
    paddingTop: '20px',
  },
  footer: {
    fontSize: '12px',
    color: 'oklch(0.7699 0 0)',
    textAlign: 'center' as const,
    margin: '0',
  },
};


export default EmailVerify;
