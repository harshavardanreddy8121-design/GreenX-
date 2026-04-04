export default function TestDashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '20px',
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '48px', margin: 0 }}>✅ Routing Works!</h1>
      <p style={{ fontSize: '24px', margin: 0 }}>If you see this, the dashboard loaded successfully.</p>
      <p style={{ fontSize: '18px', opacity: 0.9 }}>Test Dashboard - GreenX</p>
      
      <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
        <a href="/" style={{ 
          padding: '12px 24px', 
          background: 'white', 
          color: '#667eea', 
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}>
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
