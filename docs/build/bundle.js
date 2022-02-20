
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/elements/Section.svelte generated by Svelte v3.46.4 */

    const file$2 = "src/elements/Section.svelte";
    const get_divider_slot_changes = dirty => ({});
    const get_divider_slot_context = ctx => ({});
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});

    function create_fragment$2(ctx) {
    	let section;
    	let div;
    	let t;
    	let current;
    	const content_slot_template = /*#slots*/ ctx[2].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[1], get_content_slot_context);
    	const divider_slot_template = /*#slots*/ ctx[2].divider;
    	const divider_slot = create_slot(divider_slot_template, ctx, /*$$scope*/ ctx[1], get_divider_slot_context);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (content_slot) content_slot.c();
    			t = space();
    			if (divider_slot) divider_slot.c();
    			attr_dev(div, "class", "container p-8 pt-12 mx-auto");
    			add_location(div, file$2, 4, 2, 82);
    			attr_dev(section, "class", /*classes*/ ctx[0]);
    			add_location(section, file$2, 3, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (content_slot) {
    				content_slot.m(div, null);
    			}

    			append_dev(section, t);

    			if (divider_slot) {
    				divider_slot.m(section, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (content_slot) {
    				if (content_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						content_slot,
    						content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[1], dirty, get_content_slot_changes),
    						get_content_slot_context
    					);
    				}
    			}

    			if (divider_slot) {
    				if (divider_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						divider_slot,
    						divider_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(divider_slot_template, /*$$scope*/ ctx[1], dirty, get_divider_slot_changes),
    						get_divider_slot_context
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 1) {
    				attr_dev(section, "class", /*classes*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			transition_in(divider_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot, local);
    			transition_out(divider_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (content_slot) content_slot.d(detaching);
    			if (divider_slot) divider_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Section', slots, ['content','divider']);
    	let { classes = '' } = $$props;
    	const writable_props = ['classes'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classes });

    	$$self.$inject_state = $$props => {
    		if ('classes' in $$props) $$invalidate(0, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [classes, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { classes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get classes() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/dividers/Spikes.svelte generated by Svelte v3.46.4 */

    const file$1 = "src/dividers/Spikes.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let path3;
    	let path4;
    	let path5;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			path4 = svg_element("path");
    			path5 = svg_element("path");
    			attr_dev(path0, "d", "M1200 0 L0 0 300 30 z");
    			attr_dev(path0, "class", "svelte-bww5s8");
    			add_location(path0, file$1, 10, 4, 251);
    			attr_dev(path1, "d", "M1200 0 L600 0 1100 60 z");
    			attr_dev(path1, "opacity", ".25");
    			attr_dev(path1, "class", "svelte-bww5s8");
    			add_location(path1, file$1, 11, 4, 290);
    			attr_dev(path2, "d", "M1200 0 L200 0 700 80 z");
    			attr_dev(path2, "opacity", ".25");
    			attr_dev(path2, "class", "svelte-bww5s8");
    			add_location(path2, file$1, 12, 4, 346);
    			attr_dev(path3, "d", "M800 0 L0 0 400 100 z");
    			attr_dev(path3, "opacity", ".25");
    			attr_dev(path3, "class", "svelte-bww5s8");
    			add_location(path3, file$1, 13, 4, 401);
    			attr_dev(path4, "d", "M1200 50 L1200 0 200 0 z");
    			attr_dev(path4, "opacity", ".2");
    			attr_dev(path4, "class", "svelte-bww5s8");
    			add_location(path4, file$1, 14, 4, 454);
    			attr_dev(path5, "d", "M800 0 L0 0 0 100 z");
    			attr_dev(path5, "opacity", ".2");
    			attr_dev(path5, "class", "svelte-bww5s8");
    			add_location(path5, file$1, 15, 4, 509);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 1200 100");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			set_style(svg, "transform", "rotateY(" + (/*flip*/ ctx[0] ? '180deg' : '0') + ")");
    			attr_dev(svg, "class", "svelte-bww5s8");
    			add_location(svg, file$1, 4, 2, 85);
    			attr_dev(div, "class", "divider-spikes svelte-bww5s8");
    			add_location(div, file$1, 3, 0, 54);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			append_dev(svg, path3);
    			append_dev(svg, path4);
    			append_dev(svg, path5);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*flip*/ 1) {
    				set_style(svg, "transform", "rotateY(" + (/*flip*/ ctx[0] ? '180deg' : '0') + ")");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Spikes', slots, []);
    	let { flip = false } = $$props;
    	const writable_props = ['flip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Spikes> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('flip' in $$props) $$invalidate(0, flip = $$props.flip);
    	};

    	$$self.$capture_state = () => ({ flip });

    	$$self.$inject_state = $$props => {
    		if ('flip' in $$props) $$invalidate(0, flip = $$props.flip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [flip];
    }

    class Spikes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { flip: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spikes",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get flip() {
    		throw new Error("<Spikes>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flip(value) {
    		throw new Error("<Spikes>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */
    const file = "src/App.svelte";

    // (14:4) 
    function create_content_slot_3(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vel\n      purus quis metus consectetur cursus eu quis leo. Fusce ipsum ex,\n      pellentesque eu mi eget, imperdiet tempus justo. Aliquam at tellus eget\n      libero accumsan tempus. Ut mattis eros hendrerit, consectetur neque eget,\n      condimentum risus. Morbi euismod erat ac enim auctor, in pretium elit\n      faucibus. Aliquam erat volutpat. Pellentesque elit diam, dignissim quis\n      gravida at, faucibus non tortor. Nulla facilisi. Class aptent taciti\n      sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.\n      Suspendisse et augue eu dui luctus feugiat. Vivamus elementum metus eros,\n      ut mattis nisl sollicitudin nec. Sed enim libero, vulputate sed efficitur\n      nec, gravida sed sem. In ac dui eu lorem tincidunt ullamcorper a quis\n      sapien.";
    			attr_dev(p, "slot", "content");
    			add_location(p, file, 13, 4, 454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_3.name,
    		type: "slot",
    		source: "(14:4) ",
    		ctx
    	});

    	return block;
    }

    // (28:4) 
    function create_divider_slot_3(ctx) {
    	let spikes;
    	let div;
    	let current;

    	spikes = new Spikes({
    			props: { slot: "divider" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(spikes.$$.fragment);
    			set_style(div, "display", "contents");
    			set_style(div, "--color", "rgb(37 99 235)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(spikes, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spikes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spikes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(spikes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_divider_slot_3.name,
    		type: "slot",
    		source: "(28:4) ",
    		ctx
    	});

    	return block;
    }

    // (31:4) 
    function create_content_slot_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque vel\n      purus quis metus consectetur cursus eu quis leo. Fusce ipsum ex,\n      pellentesque eu mi eget, imperdiet tempus justo. Aliquam at tellus eget\n      libero accumsan tempus. Ut mattis eros hendrerit, consectetur neque eget,\n      condimentum risus. Morbi euismod erat ac enim auctor, in pretium elit\n      faucibus. Aliquam erat volutpat. Pellentesque elit diam, dignissim quis\n      gravida at, faucibus non tortor. Nulla facilisi. Class aptent taciti\n      sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.\n      Suspendisse et augue eu dui luctus feugiat. Vivamus elementum metus eros,\n      ut mattis nisl sollicitudin nec. Sed enim libero, vulputate sed efficitur\n      nec, gravida sed sem. In ac dui eu lorem tincidunt ullamcorper a quis\n      sapien.";
    			attr_dev(p, "slot", "content");
    			add_location(p, file, 30, 4, 1454);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_2.name,
    		type: "slot",
    		source: "(31:4) ",
    		ctx
    	});

    	return block;
    }

    // (45:4) 
    function create_divider_slot_2(ctx) {
    	let spikes;
    	let div;
    	let current;

    	spikes = new Spikes({
    			props: { slot: "divider", flip: true },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(spikes.$$.fragment);
    			set_style(div, "display", "contents");
    			set_style(div, "--color", "rgb(131 24 67)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(spikes, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spikes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spikes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(spikes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_divider_slot_2.name,
    		type: "slot",
    		source: "(45:4) ",
    		ctx
    	});

    	return block;
    }

    // (48:4) 
    function create_content_slot_1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Integer facilisis quam vel magna accumsan, quis cursus orci fermentum.\n      Vivamus eget magna dapibus, convallis nibh at, euismod enim. Phasellus\n      massa eros, tristique id tellus at, venenatis ultrices lorem. Sed pretium\n      interdum dolor sed euismod. Mauris malesuada fermentum orci eu ultrices.\n      Phasellus pharetra nibh nec ipsum lobortis imperdiet. Aliquam semper nisl\n      sed justo malesuada vulputate. In in volutpat libero. Duis ac urna\n      elementum, tristique dui vitae, aliquet nibh. Phasellus eget ullamcorper\n      arcu. Sed ut felis enim. Pellentesque blandit, sem eu imperdiet aliquet,\n      turpis purus feugiat odio, a pulvinar dui velit consequat felis. Proin a\n      quam vitae metus consequat euismod. Morbi convallis sollicitudin aliquam.\n      Integer fringilla diam ut luctus mollis.";
    			attr_dev(p, "slot", "content");
    			add_location(p, file, 47, 4, 2459);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(48:4) ",
    		ctx
    	});

    	return block;
    }

    // (61:4) 
    function create_divider_slot_1(ctx) {
    	let spikes;
    	let div;
    	let current;

    	spikes = new Spikes({
    			props: { slot: "divider" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(spikes.$$.fragment);
    			set_style(div, "display", "contents");
    			set_style(div, "--color", "rgb(21 128 61)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(spikes, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spikes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spikes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(spikes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_divider_slot_1.name,
    		type: "slot",
    		source: "(61:4) ",
    		ctx
    	});

    	return block;
    }

    // (65:4) 
    function create_content_slot(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "In bibendum id arcu ut congue. Nullam ornare lacus sit amet nunc\n      facilisis, finibus ornare lectus feugiat. Nunc a metus leo. Duis facilisis\n      pharetra feugiat. Praesent nec augue eu diam finibus ultricies eget\n      egestas quam. Nullam semper dui vel porttitor fringilla. Aenean at libero\n      ex. Fusce tempor arcu viverra purus pellentesque, nec fringilla odio\n      blandit. Duis rutrum orci risus, at hendrerit lacus pulvinar dapibus. Sed\n      suscipit libero nunc, eget commodo enim ornare sit amet. Curabitur finibus\n      massa non nulla pulvinar, quis convallis purus venenatis. Nunc ultricies\n      malesuada diam, eu convallis nisi malesuada ac. Mauris accumsan diam\n      dolor, id auctor dolor congue sed. Mauris vitae lobortis lectus.";
    			attr_dev(p, "slot", "content");
    			add_location(p, file, 64, 4, 3425);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(65:4) ",
    		ctx
    	});

    	return block;
    }

    // (77:4) 
    function create_divider_slot(ctx) {
    	let spikes;
    	let div;
    	let current;

    	spikes = new Spikes({
    			props: { slot: "divider" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(spikes.$$.fragment);
    			set_style(div, "display", "contents");
    			set_style(div, "--color", "rgb(17 24 39)");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(spikes, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spikes.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spikes.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(spikes, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_divider_slot.name,
    		type: "slot",
    		source: "(77:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let header;
    	let div;
    	let h10;
    	let t1;
    	let h11;
    	let t3;
    	let spikes;
    	let div_1;
    	let t4;
    	let section0;
    	let t5;
    	let section1;
    	let t6;
    	let section2;
    	let t7;
    	let section3;
    	let t8;
    	let footer;
    	let current;
    	spikes = new Spikes({ $$inline: true });

    	section0 = new Section({
    			props: {
    				classes: "bg-red-700",
    				$$slots: {
    					divider: [create_divider_slot_3],
    					content: [create_content_slot_3]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section1 = new Section({
    			props: {
    				classes: "bg-blue-600",
    				$$slots: {
    					divider: [create_divider_slot_2],
    					content: [create_content_slot_2]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section2 = new Section({
    			props: {
    				classes: "bg-pink-900",
    				$$slots: {
    					divider: [create_divider_slot_1],
    					content: [create_content_slot_1]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section3 = new Section({
    			props: {
    				classes: "bg-green-700",
    				$$slots: {
    					divider: [create_divider_slot],
    					content: [create_content_slot]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			header = element("header");
    			div = element("div");
    			h10 = element("h1");
    			h10.textContent = "Some Shouting Text";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "probably my name and positions";
    			t3 = space();
    			div_1 = element("div");
    			create_component(spikes.$$.fragment);
    			t4 = space();
    			create_component(section0.$$.fragment);
    			t5 = space();
    			create_component(section1.$$.fragment);
    			t6 = space();
    			create_component(section2.$$.fragment);
    			t7 = space();
    			create_component(section3.$$.fragment);
    			t8 = space();
    			footer = element("footer");
    			footer.textContent = "Footer text that no one's gonna look at";
    			attr_dev(h10, "class", "text-6xl");
    			add_location(h10, file, 7, 6, 246);
    			attr_dev(h11, "class", "text-2xl");
    			add_location(h11, file, 8, 6, 297);
    			attr_dev(div, "class", "p-16 pt-24 text-center");
    			add_location(div, file, 6, 4, 203);
    			set_style(div_1, "display", "contents");
    			set_style(div_1, "--color", "rgb(185 28 28)");
    			attr_dev(header, "class", "bg-gray-900 text-gray-400 ");
    			add_location(header, file, 5, 2, 155);
    			attr_dev(footer, "class", "bg-gray-900 text-sm text-gray-400 p-16 text-center");
    			add_location(footer, file, 79, 2, 4290);
    			attr_dev(main, "class", "min-h-screen");
    			add_location(main, file, 4, 0, 125);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, header);
    			append_dev(header, div);
    			append_dev(div, h10);
    			append_dev(div, t1);
    			append_dev(div, h11);
    			append_dev(header, t3);
    			append_dev(header, div_1);
    			mount_component(spikes, div_1, null);
    			append_dev(main, t4);
    			mount_component(section0, main, null);
    			append_dev(main, t5);
    			mount_component(section1, main, null);
    			append_dev(main, t6);
    			mount_component(section2, main, null);
    			append_dev(main, t7);
    			mount_component(section3, main, null);
    			append_dev(main, t8);
    			append_dev(main, footer);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    			const section2_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section2_changes.$$scope = { dirty, ctx };
    			}

    			section2.$set(section2_changes);
    			const section3_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				section3_changes.$$scope = { dirty, ctx };
    			}

    			section3.$set(section3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spikes.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(section2.$$.fragment, local);
    			transition_in(section3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spikes.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(section2.$$.fragment, local);
    			transition_out(section3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(spikes);
    			destroy_component(section0);
    			destroy_component(section1);
    			destroy_component(section2);
    			destroy_component(section3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Section, Spikes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({ target: document.body });

    return app;

})();
//# sourceMappingURL=bundle.js.map
