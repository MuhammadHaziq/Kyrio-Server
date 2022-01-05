// Sync for Following APIs is Done
    @FormUrlEncoded
    @POST("tax/getStoreTaxes") // Done

    @FormUrlEncoded
    @POST("items/modifier/getStoreModifiers") // Done

    @GET("items/categories") // Done

    @GET("items/discount/{storeId}") // Done

    @GET("items/storeItems") // Done

    @GET("sales/all") // Done

    @GET("customers/all") // Done
// #END#

// Printer API Modals
data class PrinterModal(
    @SerializedName("_id")
    @PrimaryKey val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("Interfaces")
    val interfaces: String,
    @SerializedName("page_width")
    val pageWidths: String,
    @SerializedName("is_enabled")
    var isEnabled: Boolean
)

data class Printer(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @SerializedName("_id")
    val printerId: String = "",
    @SerializedName("name")
    val name: String,
    @SerializedName("modal_id")
    val modalId: String = "",
    @SerializedName("modal_name")
    val modalName: String = "",
    @SerializedName("connect_interface")
    val connectInterface: String = "",
    @SerializedName("paper_width")
    val paperWidth: String = "",
    @SerializedName("address")
    val address: String = "",
    @SerializedName("PRNB")
    val PRNB: Boolean,/Print receipts and bills/
    @SerializedName("PO")
    val PO: Boolean,/* Print Orders */
    @SerializedName("APR")
    val APR: Boolean /* Automatically Print Receipts */
)

data class PrinterGroup (
    @SerializedName("_id")
    @PrimaryKey val id: String,
    @SerializedName("name")
    val name: String
)