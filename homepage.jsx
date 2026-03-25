import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export default function Homepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0, padding: 0 }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
          MyApp
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>Home</a>
          <a href="#" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>About</a>
          <a href="#" style={{ color: '#4b5563', textDecoration: 'none', fontWeight: '500' }}>Contact</a>
          <button style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '1rem'
          }}>
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        backgroundColor: '#f3f4f6',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1f2937',
          maxWidth: '800px'
        }}>
          Welcome to MyApp
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#6b7280',
          marginBottom: '2.5rem',
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          Build amazing things with React. Simple, fast, and powerful.
        </p>
        <button style={{
          padding: '0.875rem 2.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          transition: 'background-color 0.3s'
        }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          Get Started
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '5rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '3.5rem',
          color: '#1f2937'
        }}>
          Why choose us
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {[
            { title: 'Fast & Reliable', description: 'Lightning quick performance with 99.9% uptime' },
            { title: 'Easy to Use', description: 'Intuitive interface anyone can learn in minutes' },
            { title: 'Secure', description: 'Enterprise-grade security and data protection' }
          ].map((feature, idx) => (
            <div key={idx} style={{
              padding: '2rem',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'box-shadow 0.3s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
            >
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#1f2937'
              }}>
                {feature.title}
              </h3>
              <p style={{
                color: '#6b7280',
                lineHeight: '1.6'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: '#3b82f6',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>
          Ready to get started?
        </h2>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '2.5rem',
          opacity: '0.95',
          maxWidth: '600px',
          margin: '0 auto 2.5rem'
        }}>
          Join thousands of happy users today.
        </p>
        <button style={{
          padding: '0.875rem 2.5rem',
          backgroundColor: 'white',
          color: '#3b82f6',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'background-color 0.3s'
        }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
        >
          Sign Up Now
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2.5rem',
        textAlign: 'center',
        color: '#6b7280',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#ffffff'
      }}>
        <p>© 2024 MyApp. All rights reserved.</p>
      </footer>
    </div>
  );
}