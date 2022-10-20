const fs = require("fs");
class Products {
  constructor(name) {
    this.name = name;
  }

  async getAllProducts() {
    try {
      const all = JSON.parse(
        await fs.promises.readFile(`src/db/${this.name}.json`)
      );
      return all;
    } catch (err) {
      console.log(err);
    }
  }

  // Get Poduct By ID
  async getProductById(id) {
    try {
      const all = await this.getAllProducts();
      const allProds = all.find((item) => item.id === id);
      return allProds;
    } catch (err) {
      console.log(err);
    }
  }

  // Create new Product
  async createProduct(objProd) {
    try {
      const all = await this.getAllProducts();
      const newProd = objProd;
      objProd.id = all.length + 1;
      all.push(newProd);
      await fs.promises.writeFile(
        `src/db/${this.name}.json`,
        JSON.stringify(all)
      );
      return all;
    } catch (error) {
      console.log(error);
    }
  }

  // Update Product
  async updateProduct(objProd) {
    try {
      let all = await this.getAllProducts();
      all = all.map((item) => (item.id !== objProd.id ? item : objProd));

      await fs.promises.writeFile(
        `src/db/${this.name}.json`,
        JSON.stringify(all)
      );
      return all;
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Product By ID
  async deleteProduct(id) {
    try {
      const all = await this.getAllProducts();
      const allFilterproducts = all.filter((item) => item.id !== id);
      if (JSON.stringify(all) !== JSON.stringify(allFilterproducts)) {
        await fs.promises.writeFile(
          `src/db/${this.name}.json`,
          JSON.stringify(allFilterproducts)
        );
        return allFilterproducts;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = Products;
