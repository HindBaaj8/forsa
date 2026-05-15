<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $name;

    public function __construct($code, $name)
    {
        $this->code = $code;
        $this->name = $name;
    }

    public function build()
    {
        return $this->subject('🔐 رمز التحقق - فرصة عمل')
                    ->view('emails.verification')
                    ->with([
                        'code' => $this->code,
                        'name' => $this->name
                    ]);
    }
}