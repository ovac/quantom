<?php

/**
 * @package     <%= vendor %>\<%= project %>
 * @link        <%= website %>
 *
 * @author      <%= authorName %> <<%= authorEmail %>>
 * @link        <%= authorWebsite %>
 *
 * @license     <%= license %>
 * @copyright   (c) 2018, <%= company %>
 */

namespace <%= namespace %>\<%= module %>\Tests\Unit\<%= className %>;

use Mockery as m;
use PHPUnit\Framework\TestCase;

/**
 * <%= className %> Test
 *
 * Test case for <%= className %> class
 */
class Test extends TestCase
{
    /**
     * <%= paramDescription %>.
     *
     * @var string
     */
    protected $<%= paramName %>;
    /**
     * Setup resources and dependencies
     *
     * @return void
     */
    public function setUp()
    {
        //
    }
    /**
     * Close mockery.
     *
     * @return void
     */
    public function tearDown()
    {
        m::close();
    }
}
