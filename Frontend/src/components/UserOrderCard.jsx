import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";


/**
 * Robust UserOrderCard
 * - merges shopOrder entries by Shop id so same shop is shown once
 * - supports populated product (item.product) or denormalized item.name/price/image
 * - safe fallbacks for missing data
 */

const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : "N/A");

const mergeShopOrderEntries = (shopOrder = []) => {
  return Object.values(
    (shopOrder || []).reduce((acc, entry) => {
      const shopId = String(
        entry?.Shop?._id ?? entry?.Shop ?? `__no_shop_${Math.random()}`
      );
      if (!acc[shopId]) {
        acc[shopId] = {
          Shop: entry.Shop,
          subtotal: Number(entry.subtotal || 0),
          shopOrderItems: Array.isArray(entry.shopOrderItems)
            ? [...entry.shopOrderItems]
            : [],
        };
      } else {
        acc[shopId].subtotal =
          (acc[shopId].subtotal || 0) + Number(entry.subtotal || 0);
        acc[shopId].shopOrderItems.push(...(entry.shopOrderItems || []));
      }
      return acc;
    }, {})
  );
};

const SafeImg = ({ src, alt }) => {
  const fallback =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='90'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='12'>No image</text></svg>";
  return (
    <img
      src={src || fallback}
      alt={alt || "image"}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.currentTarget.src = fallback;
      }}
    />
  );
};

const UserOrderCard = ({ order }) => {
  const navigator = useNavigate();
  if (!order) return null;

  const merged = mergeShopOrderEntries(order.shopOrder);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between border-b pb-2">
        <div>
          <p className="font-semibold text-start">
            Order #{String(order._id ?? "").slice(-6) || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            Date: {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="text-end">
          <p className="font-semibold">
            {(order.paymentMethod ?? "").toUpperCase()}
          </p>
          <p className="text-sm text-gray-500">
            Status:{" "}
            <span className="text-rose-600 font-semibold">
              {order.status ?? "N/A"}
            </span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {merged.length === 0 ? (
          <div className="text-sm text-gray-500">No shops in this order</div>
        ) : (
          merged.map((shopEntry, idx) => {
            const shopName = shopEntry?.Shop?.name ?? "Shop Name";
            return (
              <div
                className=" border rounded-lg p-3 bg-[#fffaf7] space-y-3"
                key={shopEntry.Shop?._id ?? `shop-${idx}`}
              >
                <p className="font-medium">{shopName}</p>

                {Array.isArray(shopEntry.shopOrderItems) &&
                shopEntry.shopOrderItems.length > 0 ? (
                  shopEntry.shopOrderItems.map((it, i) => {
                    // support both shapes: populated product object or plain fields on item
                    const product = it?.product ?? {};
                    const img =
                      it?.product?.image ?? it?.image ?? product?.image ?? "";
                    const title =
                      it?.name ?? product?.name ?? it?.productName ?? "Item";
                    const qty = it?.quantity ?? 0;
                    const price = it?.price ?? it?.product?.price ?? 0;

                    return (
                      <div
                        className="flex truncate justify-between items-center text-sm"
                        key={it._id ?? product?._id ?? `item-${i}`}
                      >
                        <div className="flex  items-center border p-2 flex-col rounded-2xl  gap-2  border-gray-200 bg-white ">
                          <div className="w-20 h-16 truncate flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 g-white">
                            <SafeImg src={img} alt={title} />
                          </div>
                          <div className="truncate font-semibold">
                            <p className="truncate w-20">{title}</p>
                          </div>
                        </div>

                        <div className="text-right text-gray-700">
                          <div>Qty: {qty}</div>
                          <div>₹{price}</div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-gray-500">No items</div>
                )}

                <div className="text-right font-semibold">
                  Subtotal: ₹{shopEntry.subtotal ?? 0}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div>
        <div className="border-t pt-2 " />

        <div className="text-sm text-gray-500">
          <button onClick={()=>navigator(`/track-order/${order._id}`)} className="px-4 py-2 bg-[#ff4d2d] text-white rounded hover:bg-rose-600 transition mt-2">
            Track Order
          </button>
        </div>
        <div className="text-right font-bold text-lg">
          Total: ₹
          {merged.reduce(
            (acc, entry) => acc + (Number(entry.subtotal) || 0),
            0
          )}
        </div>
      </div>
    </div>
  );
};

// UserOrderCard.propTypes = {
//   order: PropTypes.shape({
//     _id: PropTypes.string,
//     createdAt: PropTypes.string,
//     paymentMethod: PropTypes.string,
//     status: PropTypes.string,
//     shopOrder: PropTypes.arrayOf(
//       PropTypes.shape({
//         Shop: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
//         subtotal: PropTypes.number,
//         shopOrderItems: PropTypes.arrayOf(PropTypes.object),
//       })
//     ),
//   }),
// };

export default UserOrderCard;
