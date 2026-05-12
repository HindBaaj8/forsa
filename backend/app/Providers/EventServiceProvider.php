<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

use App\Events\OrderCreated;
use App\Events\OrderStarted;
use App\Events\OrderCompleted;
use App\Events\InterestAccepted;
use App\Events\MessageSent;

use App\Listeners\SendOrderNotification;
use App\Listeners\SendOrderStartedNotification;
use App\Listeners\SendOrderCompletedNotification;
use App\Listeners\SendInterestAcceptedNotification;
use App\Listeners\SendMessageNotification;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
    \App\Events\InterestAccepted::class => [
        \App\Listeners\CreateOrderFromInterest::class,
        \App\Listeners\CreateConversationFromInterest::class,
        \App\Listeners\SendInterestAcceptedNotification::class,
        \App\Listeners\SendInterestAcceptedNotificationToClient::class,
    ],
];
}