// import { MaterialIcons } from "@expo/vector-icons";
// import { useState, useEffect } from "react";
// import { Modal, TouchableOpacity, View } from "react-native";

// type FilterModalProps = {
//     visible: boolean;
//     onDismiss: () => void;
//     filters: Filters;
//     onChange: (newFilters: Filters) => void;
//   };
  
//   const FilterModal: React.FC<FilterModalProps> = ({
//     visible, onDismiss, filters, onChange
//   }) => {
//     // local temp state so “See Items” only commits once
//     const [local, setLocal] = useState<Filters>(filters);
  
//     // reset whenever you reopen
//     useEffect(() => {
//       if (visible) setLocal(filters);
//     }, [visible]);
  
//     return (
//       <Modal
//         animationType="slide"
//         transparent
//         visible={visible}
//         onRequestClose={onDismiss}
//       >
//         <TouchableOpacity
//           style={styles.backdrop}
//           activeOpacity={1}
//           onPress={onDismiss}
//         />
//         <View style={styles.filterPanel}>
//           <View style={styles.filterHeader}>
//             <TouchableOpacity onPress={onDismiss}>
//               <MaterialIcons name="arrow-back-ios" size={24} color="#333" />
//             </TouchableOpacity>
//             <Text style={styles.filterTitle}>Filters</Text>
//             <View style={{ width: 24 }} /> {/* placeholder */}
//           </View>
  
//           {/* Price */}
//           <TouchableOpacity
//             style={styles.filterRow}
//             onPress={() => {
//               // example: toggle between no‐filter and a [min,max]
//               setLocal({
//                 ...local,
//                 price:
//                   local.price != null
//                     ? undefined
//                     : [0, 1000],
//               });
//             }}
//           >
//             <Text>Price</Text>
//             <MaterialIcons name="chevron-right" size={24} />
//           </TouchableOpacity>
  
//           {/* Condition */}
//           <TouchableOpacity
//             style={styles.filterRow}
//             onPress={() =>
//               setLocal({
//                 ...local,
//                 condition:
//                   local.condition === 'new' ? 'used' : 'new',
//               })
//             }
//           >
//             <Text>Condition</Text>
//             <MaterialIcons name="chevron-right" size={24} />
//           </TouchableOpacity>
  
//           {/* Category */}
//           <TouchableOpacity
//             style={styles.filterRow}
//             onPress={() =>
//               setLocal({
//                 ...local,
//                 category: local.category === 'Shirts' ? undefined : 'Shirts',
//               })
//             }
//           >
//             <Text>Category</Text>
//             <MaterialIcons name="chevron-right" size={24} />
//           </TouchableOpacity>
  
//           {/* Color */}
//           <TouchableOpacity
//             style={styles.filterRow}
//             onPress={() =>
//               setLocal({
//                 ...local,
//                 color: local.color === 'Blue' ? undefined : 'Blue',
//               })
//             }
//           >
//             <Text>Color</Text>
//             <MaterialIcons name="chevron-right" size={24} />
//           </TouchableOpacity>
  
//           <TouchableOpacity
//             style={styles.applyButton}
//             onPress={() => {
//               onChange(local);
//               onDismiss();
//             }}
//           >
//             <Text style={styles.applyText}>See Items</Text>
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     );
//   };
  