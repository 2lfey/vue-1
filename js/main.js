let eventBus = new Vue();

Vue.component("product-review", {
  template: `

<form class="review-form" @submit.prevent="onSubmit">

<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>

 <p>
    Would you recommend this product?
    <br>
    <label>
      No
      <input type="radio" value="false" v-model="isRecommend">
    </label>

    <label>
      Yes
      <input type="radio" value="true" v-model="isRecommend">
    </label>
  </p>

 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
 `,
  data() {
    return {
      isRecommend: null,
      name: null,
      review: null,
      rating: null,
      errors: [],
    };
  },
  methods: {
    onSubmit() {
      if (this.isRecommend != null && this.name && this.review && this.rating) {
        let productReview = {
          isRecommend: this.isRecommend,
          name: this.name,
          review: this.review,
          rating: this.rating,
        };
        eventBus.$emit("review-submitted", productReview);
        this.isRecommend = null;
        this.name = null;
        this.review = null;
        this.rating = null;
      } else {
        if (!this.isRecommend) this.errors.push("Recommed required.");
        if (!this.name) this.errors.push("Name required.");
        if (!this.review) this.errors.push("Review required.");
        if (!this.rating) this.errors.push("Rating required.");
      }
    },
  },
});

Vue.component("review-item", {
  props: {
    initial: {
      type: Object,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    }
  },
  beforeMount() {
    this.initialCopy = {...this.initial}
    this.copy = {...this.initial}
  },
  data: () => ({
    isEdit: false,
    initialCopy: {},
    copy: {}
  }),
  template: `
  <li>

    <div @click="isEdit = true" v-show="!isEdit">
      <p>{{ initialCopy.name }}</p>
      <p>Rating: {{ initialCopy.rating }}</p>
      <p>{{ initialCopy.review }}</p>
    </div>

    <form v-show="isEdit" @submit.prevent="onSubmit">

  <p>
    <label for="name">Name:</label>
    <input id="name" v-model="copy.name" placeholder="name">
  </p>

  <p>
    <label for="review">Review:</label>
    <textarea id="review" v-model="copy.review"></textarea>
  </p>

  <p>
    <label for="rating">Rating:</label>
    <select id="rating" v-model.number="copy.rating">
      <option>5</option>
      <option>4</option>
      <option>3</option>
      <option>2</option>
      <option>1</option>
    </select>
  </p>

  <p>
    <button @click="isEdit = false">Cancel</button>

    <input type="submit" value="Submit"> 
  </p>

  </form>
  </li>
  `,
  methods: {
    onSubmit() {
      eventBus.$emit("review-updated", {
        id: this.id,
        review: this.copy
      })

      this.initialCopy = this.copy
      this.isEdit = false
    },
  }
})

Vue.component("product", {
  props: {
    premium: {
      type: Boolean,
      required: true,
    },
  },
  template: `
   <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>

       <div class="product-info">
           <h1>{{ title }}</h1>
           
           <p>Price: {{ price }}<p/>

           <p v-if="inStock">In stock</p>
           <p v-else>Out of Stock</p>

           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
          
           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>    
      </div>

      <product-tabs :reviews="reviews" :shipping="shipping"></product-tabs>
    </div>
 `,
  mounted() {
    eventBus.$on("review-submitted", (productReview) => {
      this.reviews.push(productReview);
    });

    eventBus.$on("review-updated", ({id, review}) => {
      this.reviews[id] = review
    });
  },
  data() {
    return {
      product: "Socks",
      brand: "Vue Mastery",
      selectedVariant: 0,
      altText: "A pair of socks",
      variants: [
        {
          variantId: 2234,
          variantColor: "green",
          variantImage: "./assets/vmSocks-green-onWhite.jpg",
          price: 14.99,
          variantQuantity: 10,
        },
        {
          variantId: 2235,
          variantColor: "blue",
          variantImage: "./assets/vmSocks-blue-onWhite.jpg",
          price: 9.99,
          variantQuantity: 0,
        },
      ],
      reviews: [],
    };
  },
  methods: {
    addToCart() {
      this.$emit("add-to-cart", this.variants[this.selectedVariant]);
    },
    updateProduct(index) {
      this.selectedVariant = index;
      console.log(index);
    },
    addReview(productReview) {
      this.reviews.push(productReview);
    },
  },
  computed: {
    title() {
      return this.brand + " " + this.product;
    },
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    price() {
      return this.variants[this.selectedVariant].price;
    },
    shipping() {
      if (this.premium) {
        return "Free";
      } else {
        return 2.99;
      }
    },
  },
});

Vue.component("product-tabs", {
  props: {
    reviews: {
      type: Array,
      required: false,
    },
    shipping: {
      type: undefined,
      required: false,
    },
  },
  template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <review-item v-for="(review, index) in reviews" :key="index" :id="index" :initial="review"/>
         </ul>
       </div>

       <div v-show="selectedTab === 'Make a Review'">
         <product-review></product-review>
       </div>
       
       <div v-show="selectedTab === 'Shipping'">
          <p>Shipping: {{ shipping }}</p>
       </div>

       <div v-show="selectedTab === 'Details'">
         <ul>
            <li v-for="detail in details">{{ detail }}</li>
        </ul>
       </div>
     </div>
  `,
  data() {
    return {
      tabs: ["Reviews", "Make a Review", "Shipping", "Details"],
      selectedTab: "Reviews", // устанавливается с помощью @click
      details: ["80% cotton", "20% polyester", "Gender-neutral"],
    };
  },
});

let app = new Vue({
  el: "#app",
  data: {
    premium: true,
    cart: [],
    cartPrice: 0,
  },
  methods: {
    updateCart(variant) {
      this.cart.push(variant.id);
      this.cartPrice += variant.price;
    },
  },
});
