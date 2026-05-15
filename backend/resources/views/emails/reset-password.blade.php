<!-- resources/views/emails/reset-password.blade.php -->
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور</title>
    <style>
        body { font-family: 'Tajawal', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: #f39c12; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        .warning { color: #e74c3c; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐</div>
            <h1>إعادة تعيين كلمة المرور</h1>
        </div>
        <div class="content">
            <h2>مرحباً {{ $name }}!</h2>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            <p>لإعادة تعيين كلمة المرور، اضغط على الزر أدناه:</p>
            <a href="{{ $resetLink }}" class="button">إعادة تعيين كلمة المرور</a>
            <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
            <p class="warning">⚠️ هذا الرابط صالح لمدة 60 دقيقة فقط.</p>
        </div>
        <div class="footer">
            <p>© {{ date('Y') }} فرصة عمل - جميع الحقوق محفوظة</p>
        </div>
    </div>
</body>
</html>