;(function ($) {

    $.fn.extend({

        swiper: function (option) {

            // Keep caller

            option['this'] = this

            // Creat Swiper Object

            var swi = new Swiper(option)

            swi.creatContainer()

            swi.creatContent()

            if (swi.indicator) {

                // Creat indicator

                swi.creatIndicator()

                // Add indicator click event

                swi.bindIndicatorEvent()

                swi.toggleIndicator()

                swi.setIndicator()

            }

            if (swi.arrow) {

                // Creat next and previous button

                swi.creatArrow()

                swi.bindArrowEvent()

                swi.toggleArrow()
            }

            swi.autoPlay()

        }

    })

    function Swiper (option) {

        return new Swiper.prototype.init(option)

    }

    Swiper.prototype = {

        constructor: Swiper,

        init: function (option) {

            this.caller = option['this']

            this.type = option.type || 'scrollX'

            this.src = option.src || ''

            this.speed = option.speed || 600

            this.autoPlayFlag = option.autoPlay || true

            this.playSpeed = option.playSpeed || 3000

            this.indicator = option.indicator || false

            this.arrow = option.arrow || false

            this.fragmentNum = option.fragmentNum || 4

            this.color = option.color || 'white'

            this.activeColor = option.activeColor || '#248BD6'

            // Now animate index

            this.index = 0

            this.autoTimer = -1

            this.boxAttr = {}

            this.moving = false

            this.$swiperContentBox = $()

            this.$swiperContent = $()

            this.$indicatorA = $()
        },

        creatContainer: function () {

            this.caller.append($([
                '<div class="swiper-content-box">',
                '<ul class="swiper-content swiper-content-' + this.type + '">',
                '</ul>',
                '</div>'
            ].join('')))

            this.$swiperContentBox = $(this.caller.selector + ' .swiper-content-box')

            this.$swiperContent = $(this.caller.selector + ' .swiper-content')

            this.boxAttr.width = this.$swiperContentBox.width()

            this.boxAttr.height = this.$swiperContentBox.height()

            if (this.type === 'scrollX') {

                this.$swiperContent.width(this.boxAttr.width * (this.src.length + 1) + 100)

            } else if (this.type === 'scrollY') {

                this.$swiperContent.height(this.boxAttr.height * (this.src.length + 1))

            }

        },

        creatContent: function () {

            var $this = this

            if (this.type === 'scrollX' || this.type === 'scrollY') {

                this.$swiperContent.append($(
                    $.map(this.src, function (v) {

                        return '<li style="height: ' + $this.boxAttr.height + 'px"><a href="javascript:;"><img src="' + v + '" alt=""></a></li>'

                    }).join('')

                    + '<li style="height: ' + $this.boxAttr.height + 'px"><a href="javascript:;"><img src="' + $this.src[0] + '" alt="">></a></li>'
                ))

            } else if (this.type === 'fade') {

                this.$swiperContent.append($(
                    $.map(this.src, function (v) {

                        return '<li style="height: ' + $this.boxAttr.height + 'px"><a href="javascript:;"><img src="' + v + '" alt="">></a></li>'

                    }).join('')
                ))

            } else if (this.type === 'fragment') {

                for (var i = 0; i < this.fragmentNum; i++) {

                    if (i === 0)

                        this.$swiperContent.append($(
                            '<li style="height: ' + $this.boxAttr.height + 'px" class="complete-bg"><a href="javascript:;"><img src="' + $this.src[$this.index] + '" alt="">></a></li>'
                        ))

                    this.$swiperContent.append($(
                        '<li style="height: ' + $this.boxAttr.height + 'px" class="single-block"><a href="javascript:;"><img src="' + $this.src[$this.index] + '" alt="">></a></li>'
                    ))

                }

                // Set fragment position
                this.$fragmentBlock = $(this.caller.selector + ' .swiper-content-fragment .single-block')

                var fragWidth = this.boxAttr.width / this.fragmentNum

                this.$fragmentBlock.each(function (index, ele) {

                    $(ele).css({
                        width: fragWidth,
                        left: index * fragWidth
                    })

                })

                this.$fragmentImg = $(this.caller.selector + ' .swiper-content-fragment .single-block img')

                this.$fragmentImg.each(function (index, ele) {

                    $(ele).css('left', -index * fragWidth)

                })
            }

            this.$swiperContentLi = $(this.caller.selector + ' .swiper-content > li')
            this.setSwiper()
        },

        creatIndicator: function () {

            this.$swiperContentBox.append($('<div class="indicator" style="display: none"><div class="center"></div></div>'))

            var $indicatorInner = $(this.caller.selector + ' .indicator > .center')

            for (var i = 0,len = this.src.length; i < len; i++) {

                $indicatorInner.append($('<a href="javascript:;"></a>'))

            }

            this.$indicatorA = $(this.caller.selector + ' .indicator > .center > a')
        },

        creatArrow: function () {

            this.$swiperContentBox.append($('<div class="arrow" style="display: none"><div class="prev"><span></span></div><div class="next"><span></span></div></div>'))

            this.arrows = $(this.caller.selector + ' .arrow div')

            var $arrowBox = $(this.caller.selector + ' .arrow')

            $arrowBox.css('top', this.boxAttr.height / 2 - $arrowBox.height() / 2)

        },

        bindIndicatorEvent: function () {

            var $this = this

            this.$indicatorA.on('click', function () {

                var selectorA = $this.caller.selector + ' .indicator a'

                // Just variable moving is false can be move

                if (!$this.moving) {

                    // Stop autoPlay timer

                    clearInterval($this.autoTimer)

                    if ($(this).index(selectorA) === 0 && $this.index === $this.src.length - 1) {

                        $this.index = $this.src.length

                    } else {

                        $this.index = $(this).index(selectorA)

                    }

                    $this.setSwiper(function () {

                        // Use callback start autoPlay

                        $this.autoPlay()

                    })

                }

            })
        },

        bindArrowEvent: function () {

            var $this = this

            this.arrows.on('click', function () {

                // Just variable moving is false can be move

                if (!$this.moving) {

                    if ($(this).attr('class') === 'prev') {

                        $this.prevSwiper()

                    } else {

                        $this.nextSwiper()

                    }

                }

            })

        },

        toggleIndicator: function () {

            var $indicator = $(this.caller.selector + ' .swiper-content-box .indicator')

            this.$swiperContentBox.on('mouseenter', function () {

                $indicator.stop().fadeIn()

            })

            this.$swiperContentBox.on('mouseleave', function () {

                $indicator.stop().fadeOut()

            })

        },

        toggleArrow: function () {

            var $arrow = $(this.caller.selector + ' .swiper-content-box .arrow')

            this.$swiperContentBox.on('mouseenter', function () {

                $arrow.stop().fadeIn()

            })

            this.$swiperContentBox.on('mouseleave', function () {

                $arrow.stop().fadeOut()

            })

        },

        prevSwiper: function () {

            var $this = this

            clearInterval(this.autoTimer)

            this.index--

            this.setSwiper(function () {

                // Use callback start autoPlay

                $this.autoPlay()

            })

        },

        nextSwiper: function () {

            var $this = this

            clearInterval(this.autoTimer)

            this.index++

            this.setSwiper(function () {

                // Use callback start autoPlay

                $this.autoPlay()

            })

        },

        setSwiper: function (callback) {

            var $this = this

            // animation start set moving status as true

            this.moving = true

            if (this.type === 'scrollX') {

                if ($this.index < 0) $this.index = $this.src.length - 1

                this.$swiperContent.animate({

                    left: -this.index * this.boxAttr.width

                }, this.speed, 'linear', function () {

                    if ($this.indicator) $this.setIndicator()

                    if ($this.index >= $this.src.length) {

                        // Default loop

                        $(this).css({
                            'left': 0
                        })

                        $this.index = 0

                    }

                    // animation done set moving status as false

                    $this.moving = false

                    if (callback) callback()

                })

            } else if (this.type === 'scrollY') {

                if ($this.index < 0) $this.index = $this.src.length - 1

                this.$swiperContent.animate({

                    top: -this.index * this.boxAttr.height

                }, this.speed, 'linear', function () {

                    if ($this.indicator) $this.setIndicator()

                    if ($this.index >= $this.src.length) {

                        // Default loop

                        $(this).css({
                            'top': 0
                        })

                        $this.index = 0

                    }

                    $this.moving = false

                    if (callback) callback()

                })
            } else if (this.type === 'fade') {

                // Check index range

                $this.index %= $this.src.length

                if ($this.index < 0) $this.index = $this.src.length - 1

                this.$swiperContentLi.eq(this.index).fadeIn(this.speed, function () {

                    if ($this.indicator) $this.setIndicator()

                    $this.moving = false

                    if (callback) callback()

                }).siblings().fadeOut(this.speed)

            } else if (this.type === 'fragment') {

                $this.index %= $this.src.length

                if ($this.index < 0) $this.index = $this.src.length - 1

                var $completeImg = $(this.caller.selector + ' .swiper-content-fragment .complete-bg img')

                $completeImg.attr('src', this.src[this.index])

                this.recursiveFade($this.speed / $this.fragmentNum, this.$fragmentBlock, 0, function () {

                    if ($this.indicator) $this.setIndicator()

                    $this.$fragmentBlock.fadeIn(0)

                    $this.$fragmentImg.attr('src', $this.src[$this.index])

                    $this.moving = false

                    if (callback) callback()

                })

            }

        },

        setIndicator: function () {

            var indicatorIndex = this.index

            if (indicatorIndex >= this.src.length) indicatorIndex = 0

            this.$indicatorA.eq(indicatorIndex).css({
                background: this.activeColor,
                width: 30
            }).siblings().css({
                background: this.color,
                width: 20
            })

        },

        autoPlay: function () {

            if (this.autoPlayFlag) {

                var $this = this

                this.autoTimer = setInterval(function () {

                    $this.nextSwiper()

                }, this.playSpeed)

            }

        },

        recursiveFade: function (interval, $dom, index, callback) {

            var $this = this

            index = index || 0

            setTimeout (function () {

                $dom.eq(index).fadeOut()

                index++

                if (index < $dom.length) {

                    $this.recursiveFade(interval, $dom, index, callback)

                } else {

                    setTimeout(function () {

                        if (callback) callback()

                    }, 300)

                }

            }, interval)

        }

    }

    Swiper.prototype.init.prototype = Swiper.prototype

})(jQuery)