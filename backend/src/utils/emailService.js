const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      // Configure your email service (Gmail, SendGrid, etc.)
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendWelcomeEmail(user) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Welcome to FinanceTracker!',
      html: this.getWelcomeTemplate(user)
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent to:', user.email);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendBudgetAlert(user, budget, alertType) {
    const subject = this.getAlertSubject(alertType, budget);
    const html = this.getBudgetAlertTemplate(user, budget, alertType);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject,
      html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Budget alert sent to:', user.email);
    } catch (error) {
      console.error('Error sending budget alert:', error);
    }
  }

  getWelcomeTemplate(user) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to FinanceTracker! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName},</h2>
            <p>Welcome to FinanceTracker - your new financial companion! We're excited to help you take control of your finances.</p>
            
            <h3>Get Started:</h3>
            <ul>
              <li>📊 Add your first transaction</li>
              <li>💰 Set up budgets for your spending categories</li>
              <li>🎯 Create savings goals</li>
              <li>🤖 Explore AI-powered insights</li>
            </ul>
            
            <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
            
            <p>If you have any questions, feel free to reach out to our support team.</p>
            
            <p>Happy tracking!<br>The FinanceTracker Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getBudgetAlertTemplate(user, budget, alertType) {
    const percentage = (budget.spent / budget.amount) * 100;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${alertType === 'exceeded' ? '#ef4444' : alertType === 'critical' ? '#f59e0b' : '#3b82f6'}; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .progress-bar { background: #e5e7eb; border-radius: 10px; height: 10px; margin: 10px 0; }
          .progress { background: ${alertType === 'exceeded' ? '#ef4444' : alertType === 'critical' ? '#f59e0b' : '#3b82f6'}; height: 100%; border-radius: 10px; width: ${Math.min(percentage, 100)}%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Budget Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.firstName},</h2>
            <p>Your budget for <strong>${budget.category}</strong> needs attention:</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${budget.name}</h3>
              <p>Spent: $${budget.spent.toFixed(2)} / $${budget.amount.toFixed(2)}</p>
              <div class="progress-bar">
                <div class="progress"></div>
              </div>
              <p><strong>${percentage.toFixed(1)}% used</strong></p>
            </div>
            
            <p>${this.getAlertMessage(alertType, budget)}</p>
            
            <a href="${process.env.CLIENT_URL}/budgets" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Review Budgets</a>
            
            <p>Best regards,<br>The FinanceTracker Team</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAlertSubject(alertType, budget) {
    switch (alertType) {
      case 'exceeded':
        return `🚨 Budget Exceeded: ${budget.category}`;
      case 'critical':
        return `⚠️ Budget Critical: ${budget.category}`;
      case 'warning':
        return `📊 Budget Warning: ${budget.category}`;
      default:
        return `Budget Alert: ${budget.category}`;
    }
  }

  getAlertMessage(alertType, budget) {
    const percentage = (budget.spent / budget.amount) * 100;
    
    switch (alertType) {
      case 'exceeded':
        return `You've exceeded your ${budget.category} budget by $${(budget.spent - budget.amount).toFixed(2)}. Consider reviewing your spending in this category.`;
      case 'critical':
        return `Your ${budget.category} budget is ${percentage.toFixed(1)}% used with time remaining in the period. You're approaching your limit.`;
      case 'warning':
        return `Your ${budget.category} budget is ${percentage.toFixed(1)}% used. Keep an eye on your spending in this category.`;
      default:
        return `Your ${budget.category} budget needs attention.`;
    }
  }
}

module.exports = new EmailService();