<?php

namespace App\Exceptions;

use RuntimeException;

/** A failed call to the Paystack API — network error or a non-success response. Rendered as 502. */
class PaystackException extends RuntimeException {}
