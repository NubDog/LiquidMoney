import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
    Platform,
    TextInput,
    KeyboardAvoidingView
} from 'react-native';
import {
    addMonths,
    subMonths,
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    setHours,
    setMinutes
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface AppleDatePickerProps {
    visible: boolean;
    date: Date;
    onConfirm: (date: Date) => void;
    onCancel: () => void;
}

const AppleDatePicker: React.FC<AppleDatePickerProps> = ({
    visible,
    date: initialDate,
    onConfirm,
    onCancel
}) => {
    const [currentMonth, setCurrentMonth] = useState(initialDate);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    
    // Time states
    const [hourStr, setHourStr] = useState(format(initialDate, 'HH'));
    const [minuteStr, setMinuteStr] = useState(format(initialDate, 'mm'));

    useEffect(() => {
        if (visible) {
            setCurrentMonth(initialDate);
            setSelectedDate(initialDate);
            setHourStr(format(initialDate, 'HH'));
            setMinuteStr(format(initialDate, 'mm'));
        }
    }, [visible, initialDate]);

    const handleConfirm = () => {
        let finalDate = selectedDate;
        
        const h = parseInt(hourStr, 10);
        const m = parseInt(minuteStr, 10);
        
        if (!isNaN(h) && h >= 0 && h < 24) {
            finalDate = setHours(finalDate, h);
        }
        if (!isNaN(m) && m >= 0 && m < 60) {
            finalDate = setMinutes(finalDate, m);
        }

        onConfirm(finalDate);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const renderCalendar = () => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start, end });

        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        return (
            <View style={styles.calendarContainer}>
                {/* Header: Month & Nav */}
                <View style={styles.monthHeader}>
                    <Pressable onPress={prevMonth} style={styles.navBtn}>
                        <ChevronLeft size={24} color="#0A84FF" />
                    </Pressable>
                    <Text style={styles.monthText}>
                        {format(currentMonth, 'MM/yyyy')}
                    </Text>
                    <Pressable onPress={nextMonth} style={styles.navBtn}>
                        <ChevronRight size={24} color="#0A84FF" />
                    </Pressable>
                </View>

                {/* Weekday Labels */}
                <View style={styles.weekDaysRow}>
                    {weekDays.map(day => (
                        <Text key={day} style={styles.weekDayText}>{day}</Text>
                    ))}
                </View>

                {/* Days Grid */}
                <View style={styles.daysGrid}>
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <Pressable
                                key={idx}
                                onPress={() => {
                                    setSelectedDate(day);
                                    if (!isCurrentMonth) {
                                        setCurrentMonth(day);
                                    }
                                }}
                                style={[
                                    styles.dayCell,
                                    isSelected && styles.dayCellSelected
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.dayText,
                                        !isCurrentMonth && styles.dayTextDimmed,
                                        isToday && !isSelected && styles.dayTextToday,
                                        isSelected && styles.dayTextSelected
                                    ]}
                                >
                                    {format(day, 'd')}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        );
    };

    const handleTimeChange = (type: 'h' | 'm', text: string) => {
        const numeric = text.replace(/[^0-9]/g, '');
        if (type === 'h') {
            if (numeric.length <= 2) setHourStr(numeric);
        } else {
            if (numeric.length <= 2) setMinuteStr(numeric);
        }
    };

    const handleTimeBlur = (type: 'h' | 'm') => {
        if (type === 'h') {
            let h = parseInt(hourStr, 10);
            if (isNaN(h)) h = 0;
            if (h > 23) h = 23;
            setHourStr(h.toString().padStart(2, '0'));
        } else {
            let m = parseInt(minuteStr, 10);
            if (isNaN(m)) m = 0;
            if (m > 59) m = 59;
            setMinuteStr(m.toString().padStart(2, '0'));
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <Pressable style={styles.backdrop} onPress={onCancel} />
                <View style={styles.sheet}>
                    {/* Toolbar */}
                    <View style={styles.toolbar}>
                        <Pressable onPress={onCancel} style={styles.toolbarBtn}>
                            <Text style={styles.toolbarBtnText}>Hủy</Text>
                        </Pressable>
                        <Text style={styles.toolbarTitle}>Thời gian</Text>
                        <Pressable onPress={handleConfirm} style={styles.toolbarBtn}>
                            <Text style={[styles.toolbarBtnText, { fontWeight: '700' }]}>Xong</Text>
                        </Pressable>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {renderCalendar()}
                        
                        {/* Time Picker */}
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeLabel}>Giờ</Text>
                            <View style={styles.timeInputWrapper}>
                                <TextInput
                                    style={styles.timeInput}
                                    value={hourStr}
                                    onChangeText={(t) => handleTimeChange('h', t)}
                                    onBlur={() => handleTimeBlur('h')}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    selectTextOnFocus
                                />
                                <Text style={styles.timeColon}>:</Text>
                                <TextInput
                                    style={styles.timeInput}
                                    value={minuteStr}
                                    onChangeText={(t) => handleTimeChange('m', t)}
                                    onBlur={() => handleTimeBlur('m')}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                    selectTextOnFocus
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        backgroundColor: '#1C1C1E',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    },
    toolbar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    toolbarBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    toolbarBtnText: {
        color: '#0A84FF',
        fontSize: 17,
        fontWeight: '500',
    },
    toolbarTitle: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    calendarContainer: {
        marginBottom: 24,
    },
    monthHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navBtn: {
        padding: 8,
    },
    monthText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '600',
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        color: 'rgba(235, 235, 245, 0.3)',
        fontSize: 13,
        fontWeight: '600',
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: '14.28%', // 100 / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    dayCellSelected: {
        backgroundColor: '#0A84FF',
        borderRadius: 100,
    },
    dayText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '400',
    },
    dayTextDimmed: {
        color: 'rgba(235, 235, 245, 0.3)',
    },
    dayTextToday: {
        color: '#0A84FF',
        fontWeight: '700',
    },
    dayTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    timeLabel: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '500',
    },
    timeInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    timeInput: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        padding: 0,
        width: 28,
        textAlign: 'center',
    },
    timeColon: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '600',
        marginHorizontal: 4,
    }
});

export default AppleDatePicker;
