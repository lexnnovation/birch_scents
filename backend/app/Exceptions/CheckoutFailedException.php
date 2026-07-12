<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * A business-rule checkout rejection (inactive item, insufficient stock) —
 * distinct from validation errors (422). Rendered as 409 (CLAUDE.md §5).
 */
class CheckoutFailedException extends RuntimeException {}
